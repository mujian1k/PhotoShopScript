#target photoshop
app.bringToFront();

//———— 修改 true / false 切换模式。true：自动记录到历史记录面板（需先点击一次脚本）false：手动点击查看————
//————上下限修改请找到(total > 5 && total <= 100)————
var USE_HISTORY_MODE =true;
//————————————————————————————————————————————
if ($.fileName) {
    // 清除旧的 notifier，避免错误触发
    try {
        app.notifiers.removeAll();
    } catch (e) {}

    if (USE_HISTORY_MODE) {
        // 注册 notifier（监听图层选择）
        try {
            app.notifiersEnabled = true;
            app.notifiers.add("slct", new File($.fileName));
        } catch (e) {
            alert("事件监听器注册失败: " + e.message);
        }

        // 初始执行一次
        updateLayerCountToHistory();
    } else {
        // 手动模式，弹出窗口
        showLayerCountUI();
    }
} else {
    alert("请先将脚本保存到本地磁盘再运行！");
}

// ========== 模式 A：输出到历史记录 ==========
function updateLayerCountToHistory() {
    try {
        var result = getSelectedLayerDetails();
        var total = result.layers + result.groups;

        if (total > 5 && total <= 100) {
            var historyMessage = "选中图层：" + result.layers + ", 图层组：" + result.groups;
            app.activeDocument.suspendHistory(historyMessage, function () {});
        }
    } catch (e) {
        // 忽略
    }
}

// ========== 模式 B：弹窗模式 ==========
function showLayerCountUI() {
    var win = new Window("dialog", "图层计数");
    win.orientation = "column";
    win.alignChildren = "left";
    win.spacing = 10;
    win.margins = 20;
    win.preferredSize.width = 400;

    var countText = win.add("statictext", undefined, "点击按钮开始计数", { multiline: true });
    countText.preferredSize.width = 360;

    var btnGroup = win.add("group");
    btnGroup.orientation = "row";
    btnGroup.alignment = "right";

    var btnCount = btnGroup.add("button", undefined, "统计选中图层");
    btnCount.preferredSize.width = 160;

    var btnClose = btnGroup.add("button", undefined, "关闭", { name: "cancel" });
    btnClose.preferredSize.width = 80;

    btnCount.onClick = function () {
        try {
            var result = getSelectedLayerDetails();
            countText.text = "已选中图层：" + result.layers + ", 图层组：" + result.groups;
        } catch (e) {
            countText.text = "无法获取图层信息，可能没有选中任何图层。";
        }
    };

    win.center();
    win.show();
}

// ========== 通用函数 ==========
function getSelectedLayerDetails() {
    var ref = new ActionReference();
    ref.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("targetLayers"));
    ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var desc = executeActionGet(ref).getList(stringIDToTypeID("targetLayers"));

    var layers = 0;
    var groups = 0;

    for (var i = 0; i < desc.count; i++) {
        var layerRef = desc.getReference(i);
        var layerIndex = layerRef.getIndex();

        var layerDesc = getLayerDescriptorByIndex(layerIndex);
        var isGroup = layerDesc.hasKey(stringIDToTypeID("layerSection")) &&
            layerDesc.getEnumerationValue(stringIDToTypeID("layerSection")) !== stringIDToTypeID("layerSectionContent");

        if (isGroup) {
            groups++;
        } else {
            layers++;
        }
    }

    return { layers: layers, groups: groups };
}

function getLayerDescriptorByIndex(index) {
    var ref = new ActionReference();
    ref.putIndex(charIDToTypeID("Lyr "), index);
    return executeActionGet(ref);
}
