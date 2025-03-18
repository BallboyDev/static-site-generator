let path = '"../../assets/img/1.png"'


console.log(path)

path = path.replace(/(?<=")[^"]*(?=\/assets)/g, 'ballboy')

console.log(path)