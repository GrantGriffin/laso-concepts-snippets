function buildTree(flatArr) {
            let tree = [],
                output = {}

            for (let i = 0; i < flatArr.length; i++) {

                //let id = flatArr[i]._id
                let parId = flatArr[i].parentCategoryId  ///CHECK this name
                let match = false
                for (let key in output) {

                    if (parId == key) {
                        match = true
                        output[key].push(flatArr[i])
                        if (output[key][0].root) {
                            tree.push(flatArr[i])
                        }
                        break
                    }
                }
                if (!match) {
                    output[parId] = []
                    output[parId][0] = { root: true }
                    output[parId].push(flatArr[i])

                    for (let j = 0; j < flatArr.length; j++) { //ahhhh horribly inefficient
                        if (parId == flatArr[j]._id) { //check name
                            output[parId][0].root = false  //can maybe store more info here about the parentID -> ID -> it's parent ID for tree height
                            break
                        }
                    }
                    if (output[parId][0].root) {
                        tree.push(flatArr[i])
                    }
                }

            }
            populate(0, [], tree)

            function populate(treeIdx, branch, node) {
                debugger
                let leaf = true
                for (var key in output) {
                    if (node[treeIdx]._id == key) {
                        leaf = false
                        branch.push({node: node, currentIdx: treeIdx})
                        node[treeIdx].children = output[key]
                        node = node[treeIdx].children
                        delete output[key]
                        populate(0, branch, node)  //idx should be 0...i think
                        break  //should we exit the entire function here?
                    }
                }
                if (leaf) {
                    if (treeIdx + 1 < node.length) {
                        treeIdx++
                    } else if (branch.length > 0) {
                        node = branch[branch.length - 1].node
                        treeIdx = branch[branch.length -1].currentIdx + 1
                        delete branch[branch.length - 1]
                    } else {
                        return tree
                    }
                    populate(treeIdx, branch, node) //re-evaluate this
                }
            }

            
            //find your parent, and stick yourself into them
            // for(var i = 0; i < tree.length; i++){
            //     for(let j = 0; j < tree[i].length; j++){

            //     }
            // }

        }