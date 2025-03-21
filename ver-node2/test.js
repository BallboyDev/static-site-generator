let temp = [1, 2, 3, 4, 5]

console.log(temp)
console.log(temp.length)

temp.length = 10

console.log(temp)
console.log(temp.length)

temp.map(() => { console.log(1) })