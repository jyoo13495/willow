const getNodeColor = (d) => {
    switch (d.label_id) {
        case 1: return '#5BC0EB'; // EXPLORATIVE
        case 2: return '#D1462F'; // START ACTION
        case 3: return '#D1462F'; // NEXT ACTION
        case 4: return '#404E4D'; // ONE TIME OBJECTIVE
        default: return '#404E4D'; // RECURRING OBJECTIVE
    }
};

module.exports.getNodeColor = getNodeColor;