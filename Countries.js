function drawCountries(data) {
    const unique = [...new Set(data.map(item => item.GEO))].map(it => {
        let code = countryCodes[it]
        if (!code) {
            console.log(`ERROR FOR: ${it}`)
        }
        return code
    });
    console.log(unique)
    //countries container
    for (let i = 0; i < unique.length; i++) {
        let element = document.createElement("img");
        element.setAttribute("src", `https://www.countryflags.io/${unique[i]}/flat/64.png`);
        element.setAttribute("id", countryCodes[unique[i]]);
        document.getElementById("countries")
            .appendChild(element)

        if (!unique[i]) {
            console.log(`ERROR: ${i} -> `)
        }

    }
}