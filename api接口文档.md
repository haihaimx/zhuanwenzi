# 创建转录(whisper

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  https://api.lightai.io/BASE_URL/v1/audio/transcriptions:
    post:
      summary: 创建转录(whisper
      deprecated: false
      description: ''
      tags:
        - 音频接口/OpenAI(TTS\Wishper
      parameters:
        - name: Authorization
          in: header
          description: ''
          required: false
          example: Bearer {{YOUR_API_KEY}}
          schema:
            type: string
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  description: >+
                    要转录的音频文件对象(不是文件名),格式为:flac、mp3、mp4、mpeg、mpga、m4a、ogg、wav 或
                    webm。

                  example: ''
                  type: string
                  format: binary
                model:
                  description: |+
                    要使用的模型 ID。目前只有 whisper-1 是可用的。

                  example: ''
                  type: string
                language:
                  description: |+
                    输入音频的语言。以 ISO-639-1 格式提供输入语言可以提高准确性和延迟。

                  example: ''
                  type: string
                prompt:
                  description: |+
                    一个可选的文本来指导模型的风格或继续之前的音频段落。提示应该与音频语言匹配。

                  example: ''
                  type: string
                response_format:
                  description: |-
                    默认为 json
                    转录输出的格式,可选择:json、text、srt、verbose_json 或 vtt。
                  example: ''
                  type: string
                temperature:
                  description: >-
                    默认为 0

                    采样温度,between 0 和 1。更高的值像 0.8 会使输出更随机,而更低的值像 0.2
                    会使其更集中和确定性。如果设置为 0,模型将使用对数概率自动增加温度直到达到特定阈值。
                  example: 0
                  type: number
              required:
                - file
                - model
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                type: object
                properties:
                  text:
                    type: string
                required:
                  - text
                x-apifox-orders:
                  - text
              example:
                text: >-
                  Imagine the wildest idea that you've ever had, and you're
                  curious about how it might scale to something that's a 100, a
                  1,000 times bigger. This is a place where you can get to do
                  that.
          headers: {}
          x-apifox-name: 成功
      security: []
      x-apifox-folder: 音频接口/OpenAI(TTS\Wishper
      x-apifox-status: released
      x-run-in-apifox: https://app.apifox.com/web/project/3868318/apis/api-139393493-run
components:
  schemas: {}
  securitySchemes: {}
servers: []
security: []

```




OpenAI(TTS\Wishper
创建转录(whisper
POST
https://api.lightai.io/v1/audio/transcriptions
最后修改时间：
大约 1 个月前
请求参数
Header 参数
Authorization
string 
可选
示例值:
Bearer {{YOUR_API_KEY}}
Body 参数multipart/form-data
file
file 
必需
要转录的音频文件对象(不是文件名),格式为:flac、mp3、mp4、mpeg、mpga、m4a、ogg、wav 或 webm。
model
string 
必需
要使用的模型 ID。目前只有 whisper-1 是可用的。
language
string 
可选
输入音频的语言。以 ISO-639-1 格式提供输入语言可以提高准确性和延迟。
prompt
string 
可选
一个可选的文本来指导模型的风格或继续之前的音频段落。提示应该与音频语言匹配。
response_format
string 
可选
默认为 json
转录输出的格式,可选择:json、text、srt、verbose_json 或 vtt。
temperature
number 
可选
默认为 0
采样温度,between 0 和 1。更高的值像 0.8 会使输出更随机,而更低的值像 0.2 会使其更集中和确定性。如果设置为 0,模型将使用对数概率自动增加温度直到达到特定阈值。
请求示例代码
http.client
Requests
import http.client
import mimetypes
from codecs import encode

conn = http.client.HTTPSConnection("{{BASE_URL}}")
dataList = []
boundary = 'wL36Yn8afVp8Ag7AmP8qZ0SA4n1v9T'
dataList.append(encode('--' + boundary))
dataList.append(encode('Content-Disposition: form-data; name=file; filename={0}'.format('')))

fileType = mimetypes.guess_type('')[0] or 'application/octet-stream'
dataList.append(encode('Content-Type: {}'.format(fileType)))
dataList.append(encode(''))

with open('', 'rb') as f:
   dataList.append(f.read())
dataList.append(encode('--' + boundary))
dataList.append(encode('Content-Disposition: form-data; name=model;'))

dataList.append(encode('Content-Type: {}'.format('text/plain')))
dataList.append(encode(''))

dataList.append(encode(""))
dataList.append(encode('--'+boundary+'--'))
dataList.append(encode(''))
body = b'\r\n'.join(dataList)
payload = body
headers = {
   'Authorization': 'Bearer {{YOUR_API_KEY}}',
   'Content-type': 'multipart/form-data; boundary={}'.format(boundary)
}
conn.request("POST", "/v1/audio/transcriptions", payload, headers)
res = conn.getresponse()
data = res.read()
print(data.decode("utf-8"))

返回响应
🟢200
成功
application/json
text
string 
必需
示例
{
  "text": "Imagine the wildest idea that you've ever had, and you're curious about how it might scale to something that's a 100, a 1,000 times bigger. This is a place where you can get to do that."
}
修改于 大约 1 个月前