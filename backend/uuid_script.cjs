const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'database', 'migrations');
const modelsDir = path.join(__dirname, 'app', 'Models');

// Replace in migrations
const files = fs.readdirSync(migrationsDir);
files.forEach(file => {
    if (file.endsWith('.php')) {
        const filePath = path.join(migrationsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Skip some standard laravel migrations if they break things, but user said "do it"
        content = content.replace(/\$table->id\(\);/g, "$table->uuid('id')->primary();");
        content = content.replace(/\$table->foreignId\('([^']+)'\)/g, "$table->foreignUuid('$1')");
        
        fs.writeFileSync(filePath, content, 'utf8');
    }
});

// Replace in Models to add HasUuids
const modelFiles = fs.readdirSync(modelsDir);
modelFiles.forEach(file => {
    if (file.endsWith('.php')) {
        const filePath = path.join(modelsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        if (!content.includes('HasUuids')) {
            content = content.replace(/use Illuminate\\Database\\Eloquent\\Model;/, "use Illuminate\\Database\\Eloquent\\Model;\nuse Illuminate\\Database\\Eloquent\\Concerns\\HasUuids;");
            content = content.replace(/use HasFactory/, "use HasFactory, HasUuids");
            // If it doesn't have HasFactory (like the ones I created)
            if (!content.includes('use HasFactory')) {
                content = content.replace(/class ([a-zA-Z0-9_]+) extends Model\n\{/, "class $1 extends Model\n{\n    use HasUuids;");
            }
            fs.writeFileSync(filePath, content, 'utf8');
        }
    }
});

// Update User model specially since it extends Authenticatable
const userModelPath = path.join(modelsDir, 'User.php');
if (fs.existsSync(userModelPath)) {
    let content = fs.readFileSync(userModelPath, 'utf8');
    if (!content.includes('HasUuids')) {
        content = content.replace(/use Laravel\\Sanctum\\HasApiTokens;/, "use Laravel\\Sanctum\\HasApiTokens;\nuse Illuminate\\Database\\Eloquent\\Concerns\\HasUuids;");
        content = content.replace(/use HasFactory, Notifiable, SoftDeletes, HasApiTokens;/, "use HasFactory, Notifiable, SoftDeletes, HasApiTokens, HasUuids;");
        fs.writeFileSync(userModelPath, content, 'utf8');
    }
}
