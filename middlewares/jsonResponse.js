function jsonResponse(req, res) {
  const ret = {
    success: true,
  };
  if (res.json_data) {
    ret.data = res.json_data;
  }
  if (res.json_error) {
    ret.success = false;
    ret.error = {
      code: res.json_error_code || 100,
      message: res.json_error,
    };
  }
  res.send(ret);
}

module.exports = jsonResponse;
