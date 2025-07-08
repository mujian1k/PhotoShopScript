/**
 * 锚点中心缩放脚本
 */

//#target photoshop
function main(){
// 检查是否选中了图层组
if (!app.activeDocument || !app.activeDocument.activeLayer || app.activeDocument.activeLayer.typename !== "LayerSet") {
    alert("请先选择一个图层组！");
    return;
}

// 创建用户界面
var dialog = new Window("dialog", "锚点中心缩放");
dialog.orientation = "column";
dialog.alignChildren = "left";

// 缩放值输入
var scaleGroup = dialog.add("group");
scaleGroup.add("statictext", undefined, "输入缩放值 (1-1000)%:");
var scaleInput = scaleGroup.add("edittext", undefined, "100");
scaleInput.characters = 5;

// 确认和取消按钮
var buttonGroup = dialog.add("group");
var confirmButton = buttonGroup.add("button", undefined, "确认", { name: "ok" });
var cancelButton = buttonGroup.add("button", undefined, "取消", { name: "cancel" });

// 按下确认按钮后的操作
confirmButton.onClick = function () {
    var scaleValue = parseFloat(scaleInput.text);

    // 验证输入值
    if (isNaN(scaleValue) || scaleValue < 1 || scaleValue > 1000) {
        alert("请输入有效的缩放值 (1-1000)！");
        return;
    }

    try {
        // 获取当前活动的图层组
        var layerGroup = app.activeDocument.activeLayer;

        // 遍历图层组中的每个图层
        for (var i = 0; i < layerGroup.layers.length; i++) {
            var layer = layerGroup.layers[i];

            // 确保是图层而不是其他组
            if (layer.typename === "ArtLayer") {
                scaleLayer(layer, scaleValue);
            }
        }

        alert("缩放完成！");
    } catch (e) {
        alert("发生错误: " + e.message);
    }

    dialog.close();
};

// 按下取消按钮
cancelButton.onClick = function () {
    dialog.close();
};

// 显示对话框
dialog.center();
dialog.show();

/**
 * 按中心点缩放图层
 * @param {ArtLayer} layer - 要缩放的图层
 * @param {number} scaleValue - 缩放百分比值
 */
function scaleLayer(layer, scaleValue) {
    var bounds = layer.bounds;
    var centerX = (bounds[0] + bounds[2]) / 2;
    var centerY = (bounds[1] + bounds[3]) / 2;

    // 将参考点设置到图层的中心
    app.activeDocument.activeLayer = layer;
    app.activeDocument.activeLayer.translate(-centerX, -centerY);

    // 执行缩放
    layer.resize(scaleValue, scaleValue, AnchorPosition.MIDDLECENTER);

    // 将图层移动回原位置
    layer.translate(centerX, centerY);
}
}
main();