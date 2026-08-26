class ApiResponse {
  constructor(statusCode, message, data = null, meta = null) {
    this.statusCode = Number(statusCode) || 200;
    this.success = this.statusCode >= 200 && this.statusCode < 300;
    this.message = String(message || "");
    this.data = data ?? null;
    this.meta = meta ?? null;
  }

  toJSON() {
    const payload = {
      success: this.success,
      message: this.message,
    };

    if (this.data !== null) {
      payload.data = this.data;
    }

    if (this.meta !== null) {
      payload.meta = this.meta;
    }

    return payload;
  }
}

export default ApiResponse;
