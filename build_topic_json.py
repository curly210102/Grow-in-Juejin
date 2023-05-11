import json
import requests


def build_topic_json():
    url = 'https://api.juejin.cn/tag_api/v1/query_topic_list'
    headers = {'Content-Type': 'application/json'}
    data = {"limit": 100, "cursor": "0", "sort_type": 7}
    all_data = {}
    has_more = True

    while (has_more):
        response = requests.post(url, headers=headers, json=data)
        response_data = response.json()
        for item in response_data['data']:
            all_data[item['topic']['title'].strip()] = item['topic_id']
        has_more = response_data['has_more']
        data['cursor'] = response_data['cursor']

    def sort_key(item):
        if item[0] in ('下班去哪儿玩', "读书会", "好文推荐", "定个小目标", "照片展览馆", "今天学到了", "技术交流圈", "理财交流圈", "一起看片", "搞笑段子", "代码人生", "打工人的日常", "体育运动俱乐部", "科技交流圈", "游戏玩家俱乐部" "萌宠报道"):
            return 0
        else:
            return 1

    sorted_items = sorted(all_data.items(), key=sort_key)

    sorted_dict = {k: v for k, v in sorted_items}

    with open("topics.json", "w", encoding="utf-8") as outfile:
        json.dump(sorted_dict, outfile, indent=4, ensure_ascii=False)


if __name__ == '__main__':
    build_topic_json()
