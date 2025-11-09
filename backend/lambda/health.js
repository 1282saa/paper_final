export const handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      success: true,
      message: '오늘 한 장 서버리스 API가 정상 작동중입니다.',
      timestamp: new Date().toISOString(),
      stage: process.env.STAGE,
    }),
  };
};
