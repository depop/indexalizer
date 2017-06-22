function indexStats() {
    var indexes = {}
    var collections = db.getCollectionNames()
    for (var cIdx in collections) {
        var cName = collections[cIdx];
        var nsName = db.getName() + "." + cName;
        if (cName.indexOf("system") == -1) {
            db.system.profile.find({ns: nsName}).batchSize(1000).forEach(function (profileDoc) {
                try {
                    if (profileDoc.query["$query"]) {
                        // printjson(profileDoc.query["$query"]);
                        var query = profileDoc.query["$query"];
                    } else {
                        // printjson(profileDoc.query);
                        var query = profileDoc.query;
                    }
                    var explain = db[cName].find(query).explain()
                    var index = explain.cursor.split(" ")[1]
                    indexes[index] = (indexes[index] || 0) + 1
                } catch (e) {
                    // ignore exceptions...
                }
            })

        }
    }

    for (var cIdx in collections) {
        var cName = collections[cIdx];
        if (cName.indexOf("system") == -1) {
            print("COLLECTION[" + cName + "]");
            var collectionIndexes = db[cName].getIndexes();
            var unused = []
            var used = {}
            var total = 0
            for (var iIdx in collectionIndexes) {
                var iName = collectionIndexes[iIdx].name;
                if (iName.indexOf("system") == -1) {
                    if (!indexes[iName]) {
                        unused.push(iName)
                    } else {
                        used[iName] = indexes[iName]
                        total += indexes[iName]
                    }
                }
            }
            print("  UNUSED INDEXES")
            unused.forEach(function(un){
                print("    " + un);
            })
            print("  USED INDEXES")
            for(var inuse in used){
                print("    " + inuse + ": " + Math.round(indexes[inuse]/total*100).toFixed(0) + "%")
            }
        }
    }
}
