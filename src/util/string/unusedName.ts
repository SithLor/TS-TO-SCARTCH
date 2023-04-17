function unusedName (name: number, existingNames: string | any[]) {
    if (existingNames.indexOf(name) < 0) return name;
    name = withoutTrailingDigits(name);
    let i = 2;
    while (existingNames.indexOf(name + i) >= 0) i++;
    return name + i;
}
export default unusedName;