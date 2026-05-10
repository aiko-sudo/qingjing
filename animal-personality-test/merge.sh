#!/bin/bash
# 合并宣传方案 HTML 文件
# 用法: bash merge.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT="$SCRIPT_DIR/promo-plan.html"

echo "🔨 开始合并宣传方案 HTML..."

# 提取各文件的 body 内容（跳过 DOCTYPE 和 head）
{
    echo '<!DOCTYPE html>'
    echo '<html lang="zh-CN">'
    echo '<head>'
    echo '    <meta charset="UTF-8">'
    echo '    <meta name="viewport" content="width=device-width, initial-scale=1.0">'
    echo '    <title>三江源动物性格测试 — 宣传方案</title>'
    echo '    <style>'
    # 从第一个文件提取样式
    sed -n '/<style>/,/<\/style>/p' "$SCRIPT_DIR/promo-01-header.html" | grep -v '<style>' | grep -v '</style>'
    echo '    </style>'
    echo '</head>'
    echo '<body>'
    
    # 合并各部分内容
    for f in promo-01-header.html promo-02-features.html promo-03-animals.html promo-04-strategy.html promo-05-copies.html promo-06-footer.html; do
        if [ -f "$SCRIPT_DIR/$f" ]; then
            # 提取 body 内的内容
            sed -n '/<body>/,/<\/body>/p' "$SCRIPT_DIR/$f" | grep -v '<body>' | grep -v '</body>'
        fi
    done
    
    echo '</body>'
    echo '</html>'
} > "$OUTPUT"

echo "✅ 合并完成！"
echo "📄 输出文件: $OUTPUT"
echo "📊 文件大小: $(du -h "$OUTPUT" | cut -f1)"
