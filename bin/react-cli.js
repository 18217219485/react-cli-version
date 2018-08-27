#!/usr/bin/env node
const program = require('commander');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const fs = require('fs');

// 交互命令
const interactionCommand = [
    {
        name: 'name',
        message: 'Project name '
    },
    {
        name: 'author',
        message: 'Author'
    },
    {
        name: 'description',
        message: 'Project description (A React.js project)'
    },
    {
        name: 'template',
        message: 'Choose template(simple-webpack, ant-design)'
    }
];
// 用户交互写入模板
const handleFileChange = (answers, name) => {
    const fileName = `${name}/package.json`;
    const meta = {
        projectName: answers.name || '',
        projectAuthor: answers.author || '',
        projectDescription: answers.description || ''
    };
    if (fs.existsSync(fileName)) {
        const content = fs.readFileSync(fileName).toString();
        const result = handlebars.compile(content)(meta);
        fs.writeFileSync(fileName, result);
    }
};
// 初始化项目
const handleCreateProject = name => {
    return inquirer.prompt(interactionCommand).then(answers => {
        const spinner = ora('正在下载模板');
        spinner.start();
        let templateType = answers.template ? answers.template : 'master';
        download(`github:18217219485/react-templates#${templateType}`, name, {clone: true}, err => {
            if (err) {
                spinner.fail();
                console.log(chalk.red(err));
            }
            else {
                spinner.succeed();
                handleFileChange(answers, name);
                console.log(chalk.green('cd ' + name + '\nnpm install \nnpm run dev'));
            }
        });
    });
};

program.version('1.0.0', '-v, --version')
    .command('init <name>')
    .action(name => {
        try {
            if (!fs.existsSync(name)) {
                handleCreateProject(name);
            }
            else {
                console.log(chalk.red('项目已经存在'));
                return;
            }
        }
        catch (e) {
            if (!name) {
                throw new Error('初始化的项目文件夹必不可少');
            }
        }
    });
program.parse(process.argv);
