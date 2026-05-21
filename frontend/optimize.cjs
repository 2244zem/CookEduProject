const fs = require('fs');
const path = require('path');

const filesToOptimize = [
  path.join(__dirname, 'src', 'pages', 'UserDashboard.tsx'),
  path.join(__dirname, 'src', 'pages', 'SmartWeatherDashboard.tsx')
];

filesToOptimize.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace heavy backdrop blurs with lighter ones
    content = content.replace(/backdrop-blur-3xl/g, 'backdrop-blur-sm');
    content = content.replace(/backdrop-blur-2xl/g, 'backdrop-blur-sm');
    content = content.replace(/backdrop-blur-xl/g, 'backdrop-blur-sm');
    content = content.replace(/backdrop-blur-md/g, 'backdrop-blur-sm');
    
    // Remove heavy animations
    content = content.replace(/animate-pulse/g, '');
    content = content.replace(/animate-bounce/g, '');
    content = content.replace(/animate-spin-slow/g, '');
    
    // Tone down shadows
    content = content.replace(/shadow-2xl/g, 'shadow-sm');
    content = content.replace(/shadow-xl/g, 'shadow-sm');
    content = content.replace(/shadow-lg/g, 'shadow-sm');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Optimized ${path.basename(filePath)}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});
