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
                        var query = profileDoc.query["$query"];
                    } else {
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
            print("checking for unused indexes in: " + cName);
            for (var iIdx in db[cName].getIndexes()) {
                var iName = db[cName].getIndexes()[iIdx].name;
                if (iName.indexOf("system") == -1) {
                    if (!indexes[iName]) {
                        print("this index is not being used: ");
                        printjson(iName);
                    }
                }
            }
        }
    }
}
