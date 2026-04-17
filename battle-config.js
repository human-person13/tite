window.BATTLE_DATA = {
    fightTypes: {
        normal: {
            label: 'Normal Fight',
            enemyHP: 100
        },
        boss: {
            label: 'Boss Fight',
            enemyHP: 150
        }
    },
    islands: {
        1: {
            name: 'Python Basics',
            enemies: {
                enemy1: { name: 'Enemy 1', hp: 50 },
                enemy2: { name: 'Enemy 2', hp: 100 },
                enemy3: { name: 'Enemy 3', hp: 110 },
                enemy4: { name: 'Enemy 4', hp: 120 },
                boss: { name: 'Boss', hp: 150 }
            },
            stages: {
                1: {
                    name: 'Variables',
                    enemyKey: 'enemy1',
                    fightType: 'normal',
                    questions: [
                        {
                            type: 'mcq',
                            prompt: 'How assign variable in Python?',
                            hint: 'No declaration keyword needed.',
                            code: '___ score = 10',
                            choices: ['', 'let', 'var', 'int'],
                            answer: ''
                        },
                        {
                            type: 'input',
                            prompt: 'Complete variable assignment.',
                            hint: 'Store number five.',
                            code: 'lives = ___',
                            answer: '5'
                        },
                        {
                            type: 'mcq',
                            prompt: 'Choose valid variable name.',
                            hint: 'Cannot start with number.',
                            code: '___ = "hero"',
                            choices: ['player_name', '2name', 'class', 'my-name'],
                            answer: 'player_name'
                        }
                    ]
                },
                2: {
                    name: 'Data Types',
                    enemyKey: 'enemy2',
                    fightType: 'normal',
                    questions: [
                        {
                            type: 'mcq',
                            prompt: 'Which is string value?',
                            hint: 'Look for quotes.',
                            code: 'title = ___',
                            choices: ['"Knight"', '10', 'True', 'None'],
                            answer: '"Knight"'
                        },
                        {
                            type: 'input',
                            prompt: 'Complete boolean value.',
                            hint: 'Python uses capitalized boolean.',
                            code: 'ready = ___',
                            answer: 'True'
                        },
                        {
                            type: 'mcq',
                            prompt: 'Which is number type?',
                            hint: 'No quotes used.',
                            code: 'xp = ___',
                            choices: ['250', '"250"', 'False', 'None'],
                            answer: '250'
                        }
                    ]
                },
                3: {
                    name: 'Operators',
                    enemyKey: 'enemy3',
                    fightType: 'normal',
                    questions: [
                        {
                            type: 'mcq',
                            prompt: 'What is value of z?',
                            hint: 'Integer addition.',
                            code: 'x = 5\ny = 8\nz = x + y',
                            choices: ['58', '13', '5', '8'],
                            answer: '13'
                        },
                        {
                            type: 'mcq',
                            prompt: 'Consider the following code.',
                            hint: 'Augmented assignment adds one.',
                            code: 'x = 5\nx += 1',
                            choices: ['55', '25', '10', '6'],
                            answer: '6'
                        },
                        {
                            type: 'mcq',
                            prompt: 'Consider the following code.',
                            hint: 'Adds ten to x.',
                            code: 'x = 5\nx += 10',
                            choices: ['5', '10', '15', '50'],
                            answer: '15'
                        }
                    ]
                },
                4: {
                    name: 'Functions',
                    enemyKey: 'enemy4',
                    fightType: 'normal',
                    questions: [
                        {
                            type: 'input',
                            prompt: 'Complete function keyword.',
                            hint: 'Python function starts with this.',
                            code: '___ greet():\n    print("Hello")',
                            answer: 'def'
                        },
                        {
                            type: 'mcq',
                            prompt: 'How call function?',
                            hint: 'Use parentheses.',
                            code: 'def greet():\n    print("Hi")\n\n___',
                            choices: ['greet()', 'call greet', 'greet', 'run(greet)'],
                            answer: 'greet()'
                        },
                        {
                            type: 'input',
                            prompt: 'Complete return statement.',
                            hint: 'Send value back.',
                            code: 'def add(a, b):\n    ___ a + b',
                            answer: 'return'
                        }
                    ]
                },
                5: {
                    name: 'Python Basics Boss',
                    enemyKey: 'boss',
                    fightType: 'boss',
                    questions: [
                        {
                            type: 'mcq',
                            prompt: 'What prints?',
                            hint: 'Read assignment carefully.',
                            code: 'name = "Ada"\nprint(name)',
                            choices: ['Ada', 'name', '"Ada"', 'None'],
                            answer: 'Ada'
                        },
                        {
                            type: 'input',
                            prompt: 'Complete loop keyword.',
                            hint: 'Iterate over values.',
                            code: '___ i in range(3):\n    print(i)',
                            answer: 'for'
                        },
                        {
                            type: 'mcq',
                            prompt: 'Which is valid boolean?',
                            hint: 'Capitalized in Python.',
                            code: 'ready = ___',
                            choices: ['True', 'true', 'TRUE', 'yes'],
                            answer: 'True'
                        }
                    ]
                }
            }
        },
        2: {
            name: 'Python Control Flow',
            enemies: {
                enemy1: { name: 'Enemy 1', hp: 50 },
                enemy2: { name: 'Enemy 2', hp: 100 },
                enemy3: { name: 'Enemy 3', hp: 110 },
                enemy4: { name: 'Enemy 4', hp: 120 },
                boss: { name: 'Boss', hp: 150 }
            },
            stages: {
                1: {
                    name: 'If Statements',
                    enemyKey: 'enemy1',
                    fightType: 'normal',
                    questions: [
                        {
                            type: 'input',
                            prompt: 'Complete if statement.',
                            hint: 'Python condition keyword.',
                            code: '___ score > 10:\n    print("Win")',
                            answer: 'if'
                        },
                        {
                            type: 'mcq',
                            prompt: 'What ends Python if line?',
                            hint: 'Important syntax symbol.',
                            code: 'if score > 10___',
                            choices: [':', ';', '{}', ','],
                            answer: ':'
                        },
                        {
                            type: 'input',
                            prompt: 'Complete else statement.',
                            hint: 'Fallback branch keyword.',
                            code: '___:\n    print("Try again")',
                            answer: 'else'
                        }
                    ]
                },
                2: {
                    name: 'While Loops',
                    enemyKey: 'enemy2',
                    fightType: 'normal',
                    questions: [
                        {
                            type: 'input',
                            prompt: 'Complete loop keyword.',
                            hint: 'Repeats while condition true.',
                            code: '___ count < 3:\n    count += 1',
                            answer: 'while'
                        },
                        {
                            type: 'mcq',
                            prompt: 'What prevents infinite loop?',
                            hint: 'Update the counter.',
                            code: 'count = 0\nwhile count < 3:\n    ___',
                            choices: ['count += 1', 'print(count)', 'while count < 3', 'count = 0'],
                            answer: 'count += 1'
                        },
                        {
                            type: 'mcq',
                            prompt: 'How many times loop runs?',
                            hint: 'Start at zero.',
                            code: 'count = 0\nwhile count < 2:\n    count += 1',
                            choices: ['1', '2', '3', '0'],
                            answer: '2'
                        }
                    ]
                },
                3: {
                    name: 'For Loops',
                    enemyKey: 'enemy3',
                    fightType: 'normal',
                    questions: [
                        {
                            type: 'mcq',
                            prompt: 'Which loop iterates sequence?',
                            hint: 'Most common Python loop.',
                            code: '___ item in items:\n    print(item)',
                            choices: ['for', 'while', 'loop', 'foreach'],
                            answer: 'for'
                        },
                        {
                            type: 'input',
                            prompt: 'Complete range loop.',
                            hint: 'Loop through three values.',
                            code: 'for i in ___(3):\n    print(i)',
                            answer: 'range'
                        },
                        {
                            type: 'mcq',
                            prompt: 'What prints last?',
                            hint: 'Count starts at zero.',
                            code: 'for i in range(3):\n    print(i)',
                            choices: ['1', '2', '3', '0'],
                            answer: '2'
                        }
                    ]
                },
                4: {
                    name: 'Conditions',
                    enemyKey: 'enemy4',
                    fightType: 'normal',
                    questions: [
                        {
                            type: 'mcq',
                            prompt: 'Which compares equality?',
                            hint: 'Double equals.',
                            code: 'if score ___ 10:\n    print("Ten")',
                            choices: ['==', '=', '!=', '>='],
                            answer: '=='
                        },
                        {
                            type: 'input',
                            prompt: 'Complete greater-than operator.',
                            hint: 'Check if larger.',
                            code: 'if lives ___ 0:\n    print("Alive")',
                            answer: '>'
                        },
                        {
                            type: 'mcq',
                            prompt: 'Which means not equal?',
                            hint: 'Python comparison operator.',
                            code: 'if a ___ b:\n    print("Different")',
                            choices: ['!=', '<>', '==', '=!'],
                            answer: '!='
                        }
                    ]
                },
                5: {
                    name: 'Control Flow Boss',
                    enemyKey: 'boss',
                    fightType: 'boss',
                    questions: [
                        {
                            type: 'input',
                            prompt: 'Complete loop keyword.',
                            hint: 'Iterate over values.',
                            code: '___ n in range(5):\n    print(n)',
                            answer: 'for'
                        },
                        {
                            type: 'mcq',
                            prompt: 'Which keyword handles fallback branch?',
                            hint: 'Pairs with if.',
                            code: 'if hp <= 0:\n    print("Lose")\n___:\n    print("Fight")',
                            choices: ['else', 'elif', 'except', 'finally'],
                            answer: 'else'
                        },
                        {
                            type: 'mcq',
                            prompt: 'What prints first?',
                            hint: 'Range starts at zero.',
                            code: 'for i in range(3):\n    print(i)',
                            choices: ['0', '1', '2', '3'],
                            answer: '0'
                        }
                    ]
                }
            }
        }
    },
    createDefaultConfig(islandId, stageId) {
        return {
            name: `Island ${islandId}`,
            enemies: {
                enemy1: { name: 'Enemy 1', hp: 50 },
                enemy2: { name: 'Enemy 2', hp: 100 },
                enemy3: { name: 'Enemy 3', hp: 110 },
                enemy4: { name: 'Enemy 4', hp: 120 },
                boss: { name: 'Boss', hp: 150 }
            },
            stages: {
                [stageId]: {
                    name: `Stage ${stageId}`,
                    enemyKey: 'enemy1',
                    fightType: 'normal',
                    questions: [
                        {
                            type: 'mcq',
                            prompt: 'Choose missing keyword.',
                            hint: 'Python assignment needs no keyword.',
                            code: '___ score = 10',
                            choices: ['', 'let', 'var', 'const'],
                            answer: ''
                        },
                        {
                            type: 'input',
                            prompt: 'Complete string value.',
                            hint: 'Use Python string literal.',
                            code: "quest = '___'",
                            answer: 'StudyQuest'
                        }
                    ]
                }
            }
        };
    }
};
