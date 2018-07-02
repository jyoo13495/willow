const getLinkColor = (d) => {
    switch (d.label_id) {
        case 6: return '#5BC0EB'; // EXPLORES
        case 7: return '#D1462F'; // STARTS
        case 8: return '#D1462F'; // THEN
        case 9: return '#BFADA3'; // SHOULD
        default:return '#9CB380'; // COMPLETE
    }
};

module.exports.getLinkColor = getLinkColor;