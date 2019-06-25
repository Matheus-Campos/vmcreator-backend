const fs = require('fs');
const path = require('path');
const url = require('url');
const http = require('http');
const shell = require('child_process').exec;

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

    const baseDisk = path.resolve(
      '/home/matheuscds/VirtualBox\\ VMs/Base/Base.vdi'
    );
    const disk = path.resolve(
      `/home/matheuscds/VirtualBox\\ VMs/${name}/${name}.vdi`
    );
    const scriptName = `${new Date().getTime()}-${name}-vm.sh`;
    const scriptPath = path.resolve(__dirname, '..', 'tmp', scriptName);

    const scriptContent =
      `vboxmanage createvm --name ${name} --ostype Ubuntu_64 --register;\n` +
      `vboxmanage modifyvm ${name} --memory ${ram} --cpus ${cpu} --vram 128;\n` +
      `vboxmanage clonehd ${baseDisk} ${disk} --format VDI;\n` +
      `vboxmanage storagectl ${name} --name "SATA Controller" --add sata --controller IntelAhci;\n` +
      `vboxmanage storageattach ${name} --storagectl "SATA Controller" --port 0 --device 0 --type hdd --medium ${disk};\n` +
      `vboxmanage hostonlyif ipconfig vboxnet0 --ip ${ip};\n` +
      `vboxmanage modifyvm ${name} --hostonlyadapter1 vboxnet0;\n` +
      `vboxmanage modifyvm ${name} --nic1 hostonly;\n` +
      `vboxmanage modifyvm ${name} --vrde on --vrdeaddress ${ip} --vrdemulticon on;\n` +
      `vboxmanage startvm ${name} --type headless;\n`;

    if (fs.existsSync(scriptPath)) {
      fs.unlinkSync(scriptPath);
    }

    fs.appendFileSync(scriptPath, scriptContent);

    shell(
      `source ${scriptPath}`,
      { shell: '/bin/bash' },
      (err, stdout, stderr) => {
        if (err) console.log(stderr);

        console.log(stdout + '\n');
      }
    );

    return res.end();
  } else {
    res.statusCode = 404;
    return res.end();
  }
});

server.listen(3333, () => console.log('Listening on port 3333'));
