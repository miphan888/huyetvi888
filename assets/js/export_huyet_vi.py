import json
import csv
import re
import os

def main():
    js_file = 'data.js'
    csv_file = 'huyet_vi.csv'

    if not os.path.exists(js_file):
        print(f"❌ Không tìm thấy file: {js_file}")
        return

    with open(js_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Trích xuất mảng JSON từ file .js
    start = content.find('[')
    end = content.rfind(']')
    json_str = re.sub(r',\s*([}\]])', r'\1', content[start:end + 1])
    data = json.loads(json_str)

    # Xuất CSV chỉ với maHuyet và tenViet
    with open(csv_file, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['maHuyet', 'tenViet'])
        for item in data:
            writer.writerow([item.get('maHuyet', ''), item.get('tenViet', '')])

    print(f"✅ Xuất {len(data)} huyệt vị ra: {csv_file}")

if __name__ == '__main__':
    main()