import fs from 'fs';
const key = 'AIzaSyCiUE_u4XVfj70W8h9MZCuxJbPfAsfhAiA';
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
  .then(res => res.json())
  .then(data => {
    if (data.models) {
      const activeModels = data.models.map(m => m.name).filter(n => n.includes('gemini') && !n.includes('preview') && !n.includes('audio'));
      fs.writeFileSync('models.json', JSON.stringify(activeModels, null, 2));
    }
  });
