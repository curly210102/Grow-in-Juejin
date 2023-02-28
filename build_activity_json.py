import asyncio
import requests
import json
import os
import datetime

# 飞书多维表格 -> json

APP_TOKEN = os.environ.get("APP_TOKEN", "")
APP_ID = os.environ.get("APP_ID", "")
APP_SECRET = os.environ.get("APP_SECRET", "")


def isMultilineText(arg):
    return isinstance(arg, list)


def isLink(arg):
    return isinstance(arg, dict) and bool(arg["link"])


def convertMultilineTextToString(mlText):
    str = ""
    if mlText:
        for line in mlText:
            if line["type"] == "url":
                str += f'[{line["text"]}]({line["link"]})'
            else:
                str += line["text"]
    return str


def extractLinkFromMultilineText(mlText):
    link = ""
    if mlText:
        for line in mlText:
            if line["type"] == "url":
                link = line["link"]
                break
    return link


def requestAccessToken():
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    body = {
        "app_id": APP_ID,
        "app_secret": APP_SECRET,
    }
    response = requests.post(url, json=body)
    if response.status_code == 200:
        data = response.json()
        if data["code"] != 0:
            return False
        else:
            globals()["access_token"] = data["tenant_access_token"]
            return True
    else:
        return False


async def requestTableRecords(app_token, table_id, view_id=None, optionalParams=None):
    url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records"
    access_token = globals().get("access_token")
    # set the header with Authorization access token
    header = {"Authorization": f"Bearer {access_token}"}
    # set the query parameters with view_id if given
    params = {
        "text_field_as_array": True,
    }
    if view_id:
        params["view_id"] = view_id
    if optionalParams:
        params.update(optionalParams)
    # send a get request and return the response
    response = requests.get(url, headers=header, params=params)
    data = response.json()
    if data["code"] != 0:
        return None
    else:
        return data['data']


def parseActivityRecordsToList(records=[]):
    mapping_dict = {"关联键": "key", "备注": "desc", "开始时间": "startTimeStamp",
                    "活动名": "title", "活动链接": "docLink", "类别": "category", "结束时间": "endTimeStamp", "头图": "figure"}
    list = []

    if records:
        for record in records:
            obj = {mapping_dict[k]: convertMultilineTextToString(
                v) if isMultilineText(v) else v["link"] if isLink(v) else v for k, v in record["fields"].items()}
            list.append(obj)
    return list


def parseActivityRewardToRewardList(records=[]):
    list = [{
        "title": "进度追踪",
        "rewards": []
    }, {
        "title": "数量追踪",
        "rewards": []
    }]

    if records:
        for record in records:
            fields = record["fields"]
            if fields.get("最小天数"):
                list[0]["rewards"].append({
                    "name": convertMultilineTextToString(fields.get("等级名")),
                    "days": int(fields.get("最小天数"))
                })
            elif fields.get("数量"):
                list[1]["rewards"].append({
                    "name": convertMultilineTextToString(fields.get("等级名")),
                    "count": int(fields.get("数量"))
                })
    return list


def parseActivityRuleMap(records=[]):
    ruleMap = {
        "categories": [],
        "signSlogan": "",
        "signLink": "",
        "tagNames": [],
        "wordCount": 0,
    }
    for record in records:
        fields = record["fields"]
        ruleMap["categories"] = fields.get("分类") or []
        ruleMap["tagNames"] = fields.get("标签") or []
        ruleMap["wordCount"] = fields.get("字数") or 0
        ruleMap["signSlogan"] = convertMultilineTextToString(
            fields.get("关键词")).replace("N", "\\d+")
        ruleMap["signLink"] = extractLinkFromMultilineText(fields.get("关键词"))
    return ruleMap


async def fetchAndBuildDictionary():
    today = str(datetime.date.today()-datetime.timedelta(days=14))
    result = await requestTableRecords(APP_TOKEN, "tblM2kMhEmywUdD2", "vewD9xQ8SV", {
        "filter": f'OR(CurrentValue.[结束时间]>=TODATE("{today}"),CurrentValue.[结束时间]="")',
        "sort": '["结束时间 DESC"]'
    })
    list = parseActivityRecordsToList(result.get("items"))

    relatedKeys = [item["key"] for item in list]

    activityRewardsTasks = asyncio.gather(*[requestTableRecords(APP_TOKEN, "tblWGtMT5fgnRQ9s", "vewj8t6vAm", {
        "filter": f'CurrentValue.[所属活动]="{key}"',
        "field_names": '["等级名", "最小天数", "数量"]'
    }) for key in relatedKeys])

    activityRulesTasks = asyncio.gather(*[requestTableRecords(APP_TOKEN, "tblawuUZtQTY7Tq4", "vewo5RWnaX", {
        "filter": f'CurrentValue.[所属活动]="{key}"',
        "field_names": '["关键词", "分类", "字数", "标签"]'
    }) for key in relatedKeys])

    activityRewardsResp = await activityRewardsTasks
    activityRulesResp = await activityRulesTasks

    for i, item in enumerate(list):
        if activityRewardsResp[i]:
            rewardList = parseActivityRewardToRewardList(
                activityRewardsResp[i].get("items"))
            item["rewards"] = rewardList
        if activityRulesResp[i].get("items"):
            ruleMap = parseActivityRuleMap(activityRulesResp[i].get("items"))
            item.update(ruleMap)

    return list


async def main():
    if (requestAccessToken()):
        dictionary = await fetchAndBuildDictionary()
        json_object = json.dumps(dictionary, indent=4, ensure_ascii=False)
        with open("activity.json", "w", encoding="utf-8") as outfile:
            outfile.write(json_object)


asyncio.run(main())
