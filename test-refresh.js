const http = require('http');
async function test() {
  const res = await fetch("http://localhost:3000/api/proxy/auth/me", {
    headers: {
      "x-orchestrate-auth": "required",
      "Cookie": "orchestrate_access_token=expired_token; orchestrate_refresh_token=fake_refresh_token"
    }
  });
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Body snippet:", text.substring(0, 100));
}
test();
