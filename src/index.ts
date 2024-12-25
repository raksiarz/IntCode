import { readFileSync } from 'fs'
import * as path from 'path'

const input = readFileSync(path.resolve(__dirname, 'input.txt'), 'utf-8').split(',').map(i => +i)

const EOF = 99 as const
const ADD = 1 as const
const MUL = 2 as const

for(let noun = 1; noun < 99; noun++) {
    for(let verb = 1; verb < 99; verb++) {
        const copy = JSON.parse(JSON.stringify(input))
        copy[1] = noun
        copy[2] = verb 
        const out = run(copy)
        if(out[0] === 19690720) {
            console.log('found noun: ', noun, ' verb: ', verb)
            break
        }
    }
}

function run(input: number[]): number[] {
    let i = 0
    while (i < input.length) {
        if (input[i] === ADD) {
            input[input[i + 3]] = input[input[i + 1]] + input[input[i + 2]]
            i += 3
        }
        if (input[i] === MUL) {
            input[input[i + 3]] = input[input[i + 1]] * input[input[i + 2]]
            i += 3
        }
        if (input[i] === EOF) break
        i++
    }
    
    return input
}

// console.log(run(input)[0])
