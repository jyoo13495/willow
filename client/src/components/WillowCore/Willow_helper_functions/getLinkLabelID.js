const getLinkLabelID = (sourceNode, targetNode) => {
    if (targetNode.label_id === 1) return 6; // Explores
    if (targetNode.label_id === 2) return 7; // Starts
    if (targetNode.label_id === 3) return 8; // Then
    if (targetNode.label_id === 4) return 10; // Completes
    if (targetNode.label_id === 5) return 10; // Completes
  }

module.exports.getLinkLabelID = getLinkLabelID;