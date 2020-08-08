const fs = require('fs');
const path = require('path');
const skynet = require('@nebulous/skynet');

let skylink;
const uploadFileToSkynet = async () => {
  console.log('Uploading file to Skynet');
  skylink = await skynet.uploadFile(
    path.join(process.cwd(), 'client', 'build', 'skynet', 'index.html'),
    { APIKey: process.env.SKYNET_API_KEY, customUserAgent: "Sia-Agent" }
  );
  console.log(`Upload successful, skylink: ${skylink}`);
  const siaskyLink = skylink.replace("sia://", "https://siasky.net/");
  console.log(`View file at Sia Skylink: ${siaskyLink}`);

  return siaskyLink;
}

module.exports = {
  uploadFileToSkynet
}
