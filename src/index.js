const fs = require('fs');
const path = require('path');
const url = require('url');
const http = require('http');

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'GET') {
    const {
      query: { name, cpu, ram, ip }
    } = url.parse(req.url, true);

    const script =
      `vboxmanage createvm --name ${name} --ostype Debian --register;\n` +
      `vboxmanage modifyvm ${name} --memory ${ram} --cpus ${cpu};\n` +
      `vboxmanage createhd --filename ${path.resolve(
        `/home/matheuscds/VirtualBox\\ VMs/${name}/${name}.vdi`
      )} --size 18000 --format VDI;\n` +
      `vboxmanage modifyvm ${name} --natbindip1 ${ip};` +
      `vboxmanage modifyvm ${name} --vrde on;\n` +
      `vboxmanage modifyvm ${name} --vrdemulticon on --vrdeport 3390;\n` +
      `vboxmanage startvm ${name} --type headless;\n`;

    const scriptPath = path.resolve(__dirname, '..', 'tmp', 'vm.sh');

    if (fs.existsSync(scriptPath)) {
      fs.unlinkSync(scriptPath);
    }

    fs.appendFileSync(scriptPath, script);

    return res.end();
  }
});

server.listen(3333, () => console.log('Listening on port 3333'));