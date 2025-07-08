function main() {
    var selectedGroup = getSelectedGroup();
    if (!selectedGroup) {
        alert("请选择一个图层组！");
        return;
    }

    var selectedLayers = getLayersInGroup(selectedGroup);
    if (selectedLayers.length < 2) {
        alert("图层组中需要至少包含两个图层！");
        return;
    }

    var dialog = new Window("dialog", "图层对齐");
    dialog.alignChildren = "fill";

    dialog.add("statictext", undefined, "注：以图层组第一个图层为基准");
    dialog.add("statictext", undefined, "输入对齐距离 (px):");
    var distanceInput = dialog.add("edittext", undefined, "10");
    distanceInput.characters = 5;

    dialog.add("statictext", undefined, "选择对齐方式:");
    var buttonGroup = dialog.add("group");
    buttonGroup.orientation = "row";

    var leftAlignButton = buttonGroup.add("button", undefined, "水平 (左)");
    var rightAlignButton = buttonGroup.add("button", undefined, "水平 (右)");
    var topAlignButton = buttonGroup.add("button", undefined, "垂直 (上)");
    var bottomAlignButton = buttonGroup.add("button", undefined, "垂直 (下)");

    // ✅ 增加“倒序排序”按钮
    var reverseOrderButton = dialog.add("button", undefined, "倒序排序");

    var cancelButton = dialog.add("button", undefined, "取消");

    // 对齐逻辑
    function alignLayers(direction, distance) {
        var baseLayerBounds = selectedLayers[0].bounds;
        var offsetX = 0;
        var offsetY = 0;

        for (var i = 1; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            var bounds = layer.bounds;

            switch (direction) {
                case "left":
                    offsetX = baseLayerBounds[0] + i * distance - bounds[0];
                    offsetY = 0;
                    break;
                case "right":
                    offsetX = baseLayerBounds[0] - i * distance - bounds[0];
                    offsetY = 0;
                    break;
                case "top":
                    offsetX = 0;
                    offsetY = baseLayerBounds[1] + i * distance - bounds[1];
                    break;
                case "bottom":
                    offsetX = 0;
                    offsetY = baseLayerBounds[1] - i * distance - bounds[1];
                    break;
            }
            layer.translate(offsetX, offsetY);
        }
    }

    // ✅ 倒序排序实现
    function reverseLayerOrder(layers) {
        var doc = app.activeDocument;
        var total = layers.length;

        for (var i = total - 1; i >= 0; i--) {
            layers[i].move(doc.activeLayer, ElementPlacement.PLACEBEFORE);
        }
    }

    // 按钮事件绑定
    leftAlignButton.onClick = function () {
        var distance = parseInt(distanceInput.text, 10) || 10;
        alignLayers("left", distance);
        dialog.close();
    };

    rightAlignButton.onClick = function () {
        var distance = parseInt(distanceInput.text, 10) || 10;
        alignLayers("right", distance);
        dialog.close();
    };

    topAlignButton.onClick = function () {
        var distance = parseInt(distanceInput.text, 10) || 10;
        alignLayers("top", distance);
        dialog.close();
    };

    bottomAlignButton.onClick = function () {
        var distance = parseInt(distanceInput.text, 10) || 10;
        alignLayers("bottom", distance);
        dialog.close();
    };

    // ✅ 倒序按钮绑定
    reverseOrderButton.onClick = function () {
        reverseLayerOrder(selectedLayers);
        dialog.close();
    };

    cancelButton.onClick = function () {
        dialog.close();
    };

    dialog.show();

    function getSelectedGroup() {
        var doc = app.activeDocument;
        if (!doc.activeLayer || doc.activeLayer.typename !== "LayerSet") {
            return null;
        }
        return doc.activeLayer;
    }

    function getLayersInGroup(group) {
        var layers = [];
        function collectLayers(layerSet) {
            for (var i = 0; i < layerSet.layers.length; i++) {
                var layer = layerSet.layers[i];
                if (layer.typename === "ArtLayer") {
                    layers.push(layer);
                } else if (layer.typename === "LayerSet") {
                    collectLayers(layer);
                }
            }
        }
        collectLayers(group);
        return layers;
    }
}
main();
