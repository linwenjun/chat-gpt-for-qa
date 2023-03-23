import fs from 'fs';
import inquirer from 'inquirer';

// 读取JSON文件
function loadJsonFile(filename) {
  return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

// 加载env.json和config.json
const envs = loadJsonFile('env.json');
const configs = loadJsonFile('config.json');

async function main() {
  // 选择环境
  const { env } = await inquirer.prompt([
    {
      type: 'list',
      name: 'env',
      message: '请选择一个环境：',
      choices: envs.map(e => e.name)
    }
  ]);

  // 选择描述
  const { config } = await inquirer.prompt([
    {
      type: 'list',
      name: 'config',
      message: '请选择一个描述：',
      choices: configs.map(c => c.description)
    }
  ]);

  // 根据选择的环境和描述找到对应的URL和脚本文件名
  const selectedEnv = envs.find(e => e.name === env);
  const selectedConfig = configs.find(c => c.description === config);

  // 导入选定的脚本并执行
  const script = await import(`./scripts/${selectedConfig.filename}`);
  script.default(selectedEnv.url);
}

main();
