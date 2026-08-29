import "dotenv/config";
import mongoose from "mongoose";
import request from "supertest";
import app from "./app.js";
import User from "./models/User.js";
import Address from "./models/Address.js";
import jwt from "jsonwebtoken";

const genToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected");

  const users = await User.find({}).limit(2);
  const user1 = users[0];
  const user2 = users[1];
  const token1 = genToken(user1);
  const token2 = user2 ? genToken(user2) : null;

  let passed = 0,
    total = 0;
  const assert = (cond, msg) => {
    total++;
    if (cond) {
      passed++;
      console.log("[PASS]", msg);
    } else console.error("[FAIL]", msg);
  };

  // Clean up test addresses
  await Address.deleteMany({ user: user1._id, fullName: /Test/ });

  // 1. Guest rejected
  let r = await request(app).get("/api/addresses");
  assert(r.status === 401, "Guest GET /api/addresses -> 401");

  r = await request(app).post("/api/addresses").send({ fullName: "Test" });
  assert(r.status === 401, "Guest POST /api/addresses -> 401");

  // 2. Auth get (may be empty)
  r = await request(app)
    .get("/api/addresses")
    .set("Cookie", [`accessToken=${token1}`]);
  assert(r.status === 200, "Auth GET /api/addresses -> 200");
  assert(Array.isArray(r.body.data.addresses), "Returns addresses array");

  // 3. Create address
  const addrPayload = {
    fullName: "Test User",
    phone: "555-1234",
    addressLine1: "123 Test St",
    city: "Lahore",
    country: "Pakistan",
  };
  r = await request(app)
    .post("/api/addresses")
    .set("Cookie", [`accessToken=${token1}`])
    .send(addrPayload);
  assert(r.status === 201, "Create address -> 201");
  const addr1 = r.body.data.address;
  assert(addr1._id, "Address has _id");
  assert(addr1.user === user1._id.toString(), "Address belongs to user1");

  // 4. Create second address as default
  r = await request(app)
    .post("/api/addresses")
    .set("Cookie", [`accessToken=${token1}`])
    .send({ ...addrPayload, fullName: "Test Default", isDefault: true });
  assert(r.status === 201, "Create default address -> 201");
  const addr2 = r.body.data.address;
  assert(addr2.isDefault === true, "New address is default");

  // Check first is no longer default
  r = await request(app)
    .get("/api/addresses")
    .set("Cookie", [`accessToken=${token1}`]);
  const allAddrs = r.body.data.addresses;
  const defaults = allAddrs.filter((a) => a.isDefault);
  assert(defaults.length === 1, "Only one default address");

  // 5. Update address
  r = await request(app)
    .patch(`/api/addresses/${addr1._id}`)
    .set("Cookie", [`accessToken=${token1}`])
    .send({ city: "Karachi" });
  assert(r.status === 200, "Update own address -> 200");
  assert(r.body.data.address.city === "Karachi", "City updated");

  // 6. Set default
  r = await request(app)
    .patch(`/api/addresses/${addr1._id}/default`)
    .set("Cookie", [`accessToken=${token1}`]);
  assert(r.status === 200, "Set default -> 200");
  assert(r.body.data.address.isDefault === true, "Is now default");
  // Verify only one default
  r = await request(app)
    .get("/api/addresses")
    .set("Cookie", [`accessToken=${token1}`]);
  const defaults2 = r.body.data.addresses.filter((a) => a.isDefault);
  assert(defaults2.length === 1, "Still only one default after setDefault");

  // 7. IDOR: user2 cannot access/modify user1 address
  if (token2) {
    r = await request(app)
      .patch(`/api/addresses/${addr1._id}`)
      .set("Cookie", [`accessToken=${token2}`])
      .send({ city: "Hacked" });
    assert(r.status === 404, "User2 cannot update user1 address -> 404");

    r = await request(app)
      .delete(`/api/addresses/${addr1._id}`)
      .set("Cookie", [`accessToken=${token2}`]);
    assert(r.status === 404, "User2 cannot delete user1 address -> 404");

    r = await request(app)
      .patch(`/api/addresses/${addr1._id}/default`)
      .set("Cookie", [`accessToken=${token2}`]);
    assert(r.status === 404, "User2 cannot set user1 address as default -> 404");
  }

  // 8. Invalid ID
  r = await request(app)
    .patch("/api/addresses/notvalidid")
    .set("Cookie", [`accessToken=${token1}`])
    .send({ city: "X" });
  assert(r.status === 400, "Invalid ObjectId -> 400");

  // 9. Missing required fields
  r = await request(app)
    .post("/api/addresses")
    .set("Cookie", [`accessToken=${token1}`])
    .send({ fullName: "Test Only" });
  assert(r.status === 400, "Missing required fields -> 400");

  // 10. Delete address
  r = await request(app)
    .delete(`/api/addresses/${addr2._id}`)
    .set("Cookie", [`accessToken=${token1}`]);
  assert(r.status === 200, "Delete own address -> 200");

  // Regression
  r = await request(app).get("/api/products");
  assert(r.status === 200, "Products API still works");
  r = await request(app)
    .get("/api/wishlist")
    .set("Cookie", [`accessToken=${token1}`]);
  assert(r.status === 200, "Wishlist API still works");

  // Cleanup
  await Address.deleteMany({ user: user1._id, fullName: /Test/ });

  console.log(`\nResults: ${passed}/${total} passed`);
  await mongoose.disconnect();
}
run().catch(console.error);
