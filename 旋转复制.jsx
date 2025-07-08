// 存储当前图层
var originalStem = app.activeDocument.activeLayer;

// 获取活动文档
var doc = app.activeDocument;

// 获取当前图层名称
var layerName = doc.activeLayer.name;

// 创建一个包含旋转锚点选项的数组
var anchorPositions = [
    "BOTTOMCENTER中下", "BOTTOMLEFT左下", "BOTTOMRIGHT右下", "MIDDLECENTER中中", 
    "MIDDLELEFT左中", "MIDDLERIGHT右中", "TOPCENTER中上", "TOPLEFT左上", "TOPRIGHT右上"
];

// 映射锚点字符串到 AnchorPosition 值
var anchorMap = {
    "BOTTOMCENTER中下": AnchorPosition.BOTTOMCENTER,
    "BOTTOMLEFT左下": AnchorPosition.BOTTOMLEFT,
    "BOTTOMRIGHT右下": AnchorPosition.BOTTOMRIGHT,
    "MIDDLECENTER中中": AnchorPosition.MIDDLECENTER,
    "MIDDLELEFT左中": AnchorPosition.MIDDLELEFT,
    "MIDDLERIGHT右中": AnchorPosition.MIDDLERIGHT,
    "TOPCENTER中上": AnchorPosition.TOPCENTER,
    "TOPLEFT左上": AnchorPosition.TOPLEFT,
    "TOPRIGHT右上": AnchorPosition.TOPRIGHT
};

// 创建用户界面窗口
var dialog = new Window("dialog", "旋转复制增强版");

// 添加说明文本
dialog.add("statictext", undefined, "已选中图层：" + layerName);

// ========== 旋转锚点选择 ==========
dialog.add("statictext", undefined, "选择锚点位置：");
var dropdown = dialog.add("dropdownlist", undefined, anchorPositions);
dropdown.selection = 3; // 默认中

// ========== 旋转方向选择 ========== 
var directionGroup = dialog.add("group");
directionGroup.add("statictext", undefined, "旋转方向:");
var directionDropdown = directionGroup.add("dropdownlist", undefined, ["顺时针", "逆时针"]);
directionDropdown.selection = 0; // 默认顺时针

// ========== 旋转数量输入 ==========
var countGroup = dialog.add("group");
countGroup.add("statictext", undefined, "输入旋转数量 (1~360):");
var countField = countGroup.add("edittext", undefined, "8");
countField.characters = 5;

// ========== 固定角度输入 ==========
var angleGroup = dialog.add("group");
angleGroup.add("statictext", undefined, "固定角度 (留空则自动计算):");
var angleField = angleGroup.add("edittext", undefined, "");
angleField.characters = 5;

// ========== 缩放比例控制 ==========
var scaleGroup = dialog.add("group");
scaleGroup.add("statictext", undefined, "缩放比例 (%):");
var scaleField = scaleGroup.add("edittext", undefined, "100");
scaleField.characters = 5;

// ========== 透明度渐变控制 ==========
var opacityGroup = dialog.add("group");
opacityGroup.add("statictext", undefined, "透明度渐变 (0~100):");
var opacityStartField = opacityGroup.add("edittext", undefined, "100");
opacityStartField.characters = 5;
opacityGroup.add("statictext", undefined, "→");
var opacityEndField = opacityGroup.add("edittext", undefined, "100");
opacityEndField.characters = 5;

// ========== 操作按钮 ==========
var buttonGroup = dialog.add("group");
var okButton = buttonGroup.add("button", undefined, "确认");
var cancelButton = buttonGroup.add("button", undefined, "取消");

// 定义确认按钮的行为
okButton.onClick = function () {
    var stemsAmount = parseInt(countField.text, 10);
    var fixedAngle = angleField.text ? parseFloat(angleField.text) : null;
    var scalePercent = parseFloat(scaleField.text) || 100; // 获取缩放比例，默认100%
    var isClockwise = directionDropdown.selection.index === 0; // 获取旋转方向
    var opacityStart = parseFloat(opacityStartField.text) || 100; // 获取起始透明度
    var opacityEnd = parseFloat(opacityEndField.text) || 100; // 获取结束透明度

    // 验证输入数量
    if (isNaN(stemsAmount) || stemsAmount <= 0 || stemsAmount > 360) {
        alert("请输入有效的旋转数量 (1~360)。");
        return;
    }

    // 验证固定角度
    if (fixedAngle !== null && (isNaN(fixedAngle) || Math.abs(fixedAngle) > 360)) {
        alert("请输入有效的旋转角度 (-360~360)。");
        return;
    }

    // 验证缩放比例
    if (isNaN(scalePercent) || scalePercent <= 0 || scalePercent > 1000) {
        alert("请输入有效的缩放比例 (0-1000%)。");
        return;
    }

    // 验证透明度值
    if (isNaN(opacityStart) || opacityStart < 0 || opacityStart > 100 || 
        isNaN(opacityEnd) || opacityEnd < 0 || opacityEnd > 100) {
        alert("请输入有效的透明度值 (0-100)。");
        return;
    }

    // 获取用户选择的锚点
    var selectedAnchor = anchorMap[dropdown.selection.text];

    // 计算旋转角度（考虑方向）
    var angle = (fixedAngle !== null ? fixedAngle : 360 / stemsAmount) * (isClockwise ? 1 : -1);

    // 保存当前标尺单位
    var savedRulerUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.PIXELS;

    // 开始复制和旋转图层
    for (var i = 1; i < stemsAmount; i++) {
        try {
            // 复制原始图层
            var newStem = originalStem.duplicate();
            
            // 计算当前旋转角度
            var currentAngle = angle * i;
            
            // ========== 旋转图层 ==========
            newStem.rotate(currentAngle, selectedAnchor);
            
            // ========== 缩放图层 ==========
            if (scalePercent !== 100) {
                var scaleFactor = Math.pow(scalePercent/100, i); // 计算累计缩放比例
                newStem.resize(scaleFactor*100, scaleFactor*100, selectedAnchor);
            }
            
            // ========== 设置透明度渐变 ==========
            if (opacityStart !== opacityEnd) {
                var t = i / (stemsAmount - 1); // 计算渐变进度 (0到1)
                var currentOpacity = opacityStart + (opacityEnd - opacityStart) * t;
                newStem.opacity = Math.max(0, Math.min(100, currentOpacity));
            }
            
        } catch(e) {
            alert("操作出错: " + e.message);
            break;
        }
    }

    // 恢复标尺单位
    app.preferences.rulerUnits = savedRulerUnits;
    
    dialog.close();
};

// 定义取消按钮的行为
cancelButton.onClick = function () {
    dialog.close();
};

// 显示窗口
dialog.show();