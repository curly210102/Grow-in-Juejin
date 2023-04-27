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
            all_data[item['topic']['title']] = item['topic_id']
        has_more = response_data['has_more']
        data['cursor'] = response_data['cursor']

    with open("topics.json", "w", encoding="utf-8") as outfile:
        json.dump(all_data, outfile, indent=4, ensure_ascii=False)


if __name__ == '__main__':
    build_topic_json()
