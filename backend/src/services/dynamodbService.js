/**
 * DynamoDB 서비스
 *
 * AWS DynamoDB와의 상호작용을 담당하는 서비스
 * Single Table Design 패턴 사용
 *
 * AI 인덱싱 키워드: DynamoDB, AWS SDK v3, Single Table, PK/SK, GSI
 */

import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  BatchWriteItemCommand,
  BatchGetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

class DynamoDBService {
  constructor() {
    this.client = new DynamoDBClient({
      region: process.env.AWS_REGION || "us-east-1",
    });
    this.tableName = process.env.DYNAMODB_TABLE_NAME || "LearningNotesTable";
  }

  /**
   * 아이템 생성
   * @param {Object} item - 저장할 데이터
   * @returns {Promise<Object>} 저장된 아이템
   */
  async putItem(item) {
    const params = {
      TableName: this.tableName,
      Item: marshall(item, { removeUndefinedValues: true }),
    };

    await this.client.send(new PutItemCommand(params));
    return item;
  }

  /**
   * 아이템 조회 (PK, SK로 직접 조회)
   * @param {string} pk - Partition Key
   * @param {string} sk - Sort Key
   * @returns {Promise<Object|null>} 조회된 아이템
   */
  async getItem(pk, sk) {
    const params = {
      TableName: this.tableName,
      Key: marshall({ PK: pk, SK: sk }),
    };

    const result = await this.client.send(new GetItemCommand(params));
    return result.Item ? unmarshall(result.Item) : null;
  }

  /**
   * 쿼리 (PK로 조회, SK 조건 추가 가능)
   * @param {string} pk - Partition Key
   * @param {Object} options - 쿼리 옵션
   * @param {string} options.skBeginsWith - SK 시작 문자열
   * @param {string} options.skEquals - SK 정확히 일치
   * @param {number} options.limit - 결과 개수 제한
   * @param {Object} options.lastEvaluatedKey - 페이지네이션 키
   * @param {string} options.filterExpression - 추가 필터
   * @param {Object} options.expressionAttributeValues - 필터 값
   * @returns {Promise<Object>} { items, lastEvaluatedKey }
   */
  async query(pk, options = {}) {
    let keyConditionExpression = "PK = :pk";
    const expressionAttributeValues = { ":pk": pk };

    // SK 조건 추가
    if (options.skBeginsWith) {
      keyConditionExpression += " AND begins_with(SK, :sk)";
      expressionAttributeValues[":sk"] = options.skBeginsWith;
    } else if (options.skEquals) {
      keyConditionExpression += " AND SK = :sk";
      expressionAttributeValues[":sk"] = options.skEquals;
    }

    const params = {
      TableName: this.tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: marshall(
        { ...expressionAttributeValues, ...options.expressionAttributeValues },
        { removeUndefinedValues: true }
      ),
    };

    // 옵션 추가
    if (options.limit) params.Limit = options.limit;
    if (options.lastEvaluatedKey) params.ExclusiveStartKey = marshall(options.lastEvaluatedKey);
    if (options.filterExpression) params.FilterExpression = options.filterExpression;
    if (options.scanIndexForward !== undefined) params.ScanIndexForward = options.scanIndexForward;

    const result = await this.client.send(new QueryCommand(params));

    return {
      items: result.Items ? result.Items.map((item) => unmarshall(item)) : [],
      lastEvaluatedKey: result.LastEvaluatedKey ? unmarshall(result.LastEvaluatedKey) : null,
      count: result.Count,
    };
  }

  /**
   * GSI 쿼리 (Global Secondary Index)
   * @param {string} indexName - 인덱스 이름
   * @param {string} gsiPk - GSI Partition Key
   * @param {Object} options - 쿼리 옵션
   * @returns {Promise<Object>} { items, lastEvaluatedKey }
   */
  async queryGSI(indexName, gsiPk, options = {}) {
    let keyConditionExpression = "GSI1PK = :gsiPk";
    const expressionAttributeValues = { ":gsiPk": gsiPk };

    // GSI SK 조건 추가
    if (options.gsiSkBeginsWith) {
      keyConditionExpression += " AND begins_with(GSI1SK, :gsiSk)";
      expressionAttributeValues[":gsiSk"] = options.gsiSkBeginsWith;
    }

    const params = {
      TableName: this.tableName,
      IndexName: indexName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: marshall(
        { ...expressionAttributeValues, ...options.expressionAttributeValues },
        { removeUndefinedValues: true }
      ),
    };

    if (options.limit) params.Limit = options.limit;
    if (options.lastEvaluatedKey) params.ExclusiveStartKey = marshall(options.lastEvaluatedKey);
    if (options.filterExpression) params.FilterExpression = options.filterExpression;
    if (options.scanIndexForward !== undefined) params.ScanIndexForward = options.scanIndexForward;

    const result = await this.client.send(new QueryCommand(params));

    return {
      items: result.Items ? result.Items.map((item) => unmarshall(item)) : [],
      lastEvaluatedKey: result.LastEvaluatedKey ? unmarshall(result.LastEvaluatedKey) : null,
      count: result.Count,
    };
  }

  /**
   * 아이템 업데이트
   * @param {string} pk - Partition Key
   * @param {string} sk - Sort Key
   * @param {Object} updates - 업데이트할 필드 { field: value }
   * @returns {Promise<Object>} 업데이트된 아이템
   */
  async updateItem(pk, sk, updates) {
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    // 업데이트 표현식 생성
    Object.entries(updates).forEach(([key, value], index) => {
      const attributeName = `#attr${index}`;
      const attributeValue = `:val${index}`;

      updateExpressions.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = key;
      expressionAttributeValues[attributeValue] = value;
    });

    // updatedAt 자동 추가
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":updatedAt"] = Date.now();
    updateExpressions.push("#updatedAt = :updatedAt");

    const params = {
      TableName: this.tableName,
      Key: marshall({ PK: pk, SK: sk }),
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: marshall(expressionAttributeValues, {
        removeUndefinedValues: true,
      }),
      ReturnValues: "ALL_NEW",
    };

    const result = await this.client.send(new UpdateItemCommand(params));
    return result.Attributes ? unmarshall(result.Attributes) : null;
  }

  /**
   * 아이템 삭제
   * @param {string} pk - Partition Key
   * @param {string} sk - Sort Key
   * @returns {Promise<void>}
   */
  async deleteItem(pk, sk) {
    const params = {
      TableName: this.tableName,
      Key: marshall({ PK: pk, SK: sk }),
    };

    await this.client.send(new DeleteItemCommand(params));
  }

  /**
   * 배치 쓰기 (최대 25개)
   * @param {Array<Object>} items - 저장할 아이템 배열
   * @returns {Promise<void>}
   */
  async batchWriteItems(items) {
    // 25개씩 분할
    const chunks = [];
    for (let i = 0; i < items.length; i += 25) {
      chunks.push(items.slice(i, i + 25));
    }

    for (const chunk of chunks) {
      const params = {
        RequestItems: {
          [this.tableName]: chunk.map((item) => ({
            PutRequest: {
              Item: marshall(item, { removeUndefinedValues: true }),
            },
          })),
        },
      };

      await this.client.send(new BatchWriteItemCommand(params));
    }
  }

  /**
   * 배치 조회 (최대 100개)
   * @param {Array<{pk: string, sk: string}>} keys - 조회할 키 배열
   * @returns {Promise<Array<Object>>} 조회된 아이템 배열
   */
  async batchGetItems(keys) {
    const params = {
      RequestItems: {
        [this.tableName]: {
          Keys: keys.map((key) => marshall({ PK: key.pk, SK: key.sk })),
        },
      },
    };

    const result = await this.client.send(new BatchGetItemCommand(params));
    const responses = result.Responses?.[this.tableName] || [];
    return responses.map((item) => unmarshall(item));
  }

  /**
   * 헬퍼: 노트 PK 생성
   * @param {string} userId - 사용자 ID
   * @returns {string} USER#userId
   */
  getUserPK(userId) {
    return `USER#${userId}`;
  }

  /**
   * 헬퍼: 노트 SK 생성
   * @param {string} timestamp - ISO 타임스탬프
   * @param {string} noteId - 노트 ID
   * @returns {string} NOTE#timestamp#noteId
   */
  getNoteSK(timestamp, noteId) {
    return `NOTE#${timestamp}#${noteId}`;
  }

  /**
   * 헬퍼: 노트 메타데이터 PK 생성
   * @param {string} noteId - 노트 ID
   * @returns {string} NOTE#noteId
   */
  getNotePK(noteId) {
    return `NOTE#${noteId}`;
  }

  /**
   * 헬퍼: 벡터 SK 생성
   * @param {string} vectorId - 벡터 ID
   * @returns {string} VECTOR#vectorId
   */
  getVectorSK(vectorId) {
    return `VECTOR#${vectorId}`;
  }

  /**
   * 헬퍼: 문제 SK 생성
   * @param {string} timestamp - ISO 타임스탬프
   * @param {string} questionSetId - 문제 세트 ID
   * @returns {string} QUESTION#timestamp#questionSetId
   */
  getQuestionSK(timestamp, questionSetId) {
    return `QUESTION#${timestamp}#${questionSetId}`;
  }
}

export default new DynamoDBService();
