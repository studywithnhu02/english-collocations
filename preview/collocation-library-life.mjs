const parse=(items)=>items.map(x=>{const [c,v,cefr='']=x.split('|');return {c:c.trim(),v:v.trim(),cefr:cefr.trim().toUpperCase(),source:'local-life'}});

export const LIFE_SUGGESTIONS=Object.freeze(parse([
// General life, education, health, travel, food, home, society and everyday communication.
  'daily routine|thói quen hằng ngày|A2','daily life|cuộc sống hằng ngày|A2','free time|thời gian rảnh|A1','spare time|thời gian rảnh|A2','quality time|thời gian chất lượng bên nhau|B1','busy schedule|lịch trình bận rộn|B1',
  'get enough sleep|ngủ đủ giấc|A2','get some rest|nghỉ ngơi một chút|A2','take a nap|ngủ trưa|A2','feel tired|cảm thấy mệt|A1','feel refreshed|cảm thấy tỉnh táo|B1','stay healthy|giữ sức khỏe|A2',
  'eat a balanced diet|ăn chế độ ăn cân bằng|B1','follow a healthy diet|theo chế độ ăn lành mạnh|B1','do regular exercise|tập thể dục thường xuyên|B1','build healthy habits|xây dựng thói quen lành mạnh|B1','maintain a healthy lifestyle|duy trì lối sống lành mạnh|B2','improve physical fitness|cải thiện thể lực|B2',
  'go for a walk|đi dạo|A1','go for a run|đi chạy|A1','go cycling|đi đạp xe|A1','work out at the gym|tập luyện ở phòng gym|B1','lift weights|tập tạ|A2','stretch your muscles|giãn cơ|B1',
  'make breakfast|làm bữa sáng|A1','cook a meal|nấu một bữa ăn|A2','prepare dinner|chuẩn bị bữa tối|A2','have lunch|ăn trưa|A1','have dinner|ăn tối|A1','grab a quick meal|ăn nhanh một bữa|B1',
  'order food|gọi đồ ăn|A1','book a table|đặt bàn|A2','pay the bill|thanh toán hóa đơn|A2','split the bill|chia hóa đơn|B1','try a new dish|thử món mới|A2','local cuisine|ẩm thực địa phương|B1',
  'fresh ingredients|nguyên liệu tươi|B1','healthy meal|bữa ăn lành mạnh|A2','home-cooked meal|bữa ăn nấu tại nhà|B1','balanced meal|bữa ăn cân bằng|B1','strong flavor|hương vị đậm|B1','light meal|bữa ăn nhẹ|A2',

  'go on holiday|đi nghỉ|A2','take a trip|đi một chuyến|A2','plan a trip|lên kế hoạch chuyến đi|A2','book a flight|đặt chuyến bay|A2','catch a flight|kịp chuyến bay|B1','miss a flight|lỡ chuyến bay|B1',
  'book a hotel|đặt khách sạn|A2','check in at a hotel|làm thủ tục nhận phòng|B1','check out of a hotel|làm thủ tục trả phòng|B1','stay at a hotel|ở tại khách sạn|A2','hotel room|phòng khách sạn|A1','room service|dịch vụ phòng|B1',
  'travel abroad|du lịch nước ngoài|A2','travel light|đi du lịch với ít hành lý|B1','travel by train|đi bằng tàu hỏa|A2','travel by air|đi bằng đường hàng không|B1','public transport|phương tiện giao thông công cộng|B1','traffic jam|tắc đường|A2',
  'take public transport|đi phương tiện công cộng|B1','catch a bus|bắt xe buýt|A1','miss the bus|lỡ xe buýt|A1','take a taxi|đi taxi|A1','rent a car|thuê ô tô|A2','drive safely|lái xe an toàn|A2',
  'tourist attraction|điểm tham quan du lịch|B1','tourist destination|điểm đến du lịch|B1','scenic view|khung cảnh đẹp|B1','travel destination|điểm đến du lịch|B1','guided tour|chuyến tham quan có hướng dẫn|B1','travel itinerary|lịch trình du lịch|B2',

  'attend a class|tham gia lớp học|A2','attend a lecture|tham dự bài giảng|A2','take a course|tham gia khóa học|A2','take an exam|thi / làm bài thi|A2','pass an exam|vượt qua kỳ thi|A2','fail an exam|trượt kỳ thi|A2',
  'do homework|làm bài tập về nhà|A1','complete an assignment|hoàn thành bài tập|B1','submit an assignment|nộp bài tập|B1','meet the requirements|đáp ứng yêu cầu|B1','study for an exam|học để thi|A2','prepare for an exam|chuẩn bị cho kỳ thi|A2',
  'take notes|ghi chép|A2','take part in a discussion|tham gia thảo luận|B1','give a presentation|thuyết trình|B1','make a presentation|thực hiện bài thuyết trình|B1','academic performance|thành tích học tập|B2','learning outcome|kết quả học tập|B2',
  'gain knowledge|tích lũy kiến thức|B1','develop a skill|phát triển kỹ năng|B1','acquire a skill|tiếp thu kỹ năng|B2','improve your vocabulary|cải thiện vốn từ vựng|A2','broaden your knowledge|mở rộng kiến thức|B2','develop critical thinking|phát triển tư duy phản biện|B2',

  'make friends|kết bạn|A1','keep in touch|giữ liên lạc|A2','stay in touch|giữ liên lạc|A2','lose touch|mất liên lạc|A2','spend time together|dành thời gian cùng nhau|A2','have a good relationship|có mối quan hệ tốt|A2',
  'build a friendship|xây dựng tình bạn|B1','maintain a relationship|duy trì một mối quan hệ|B1','start a conversation|bắt đầu cuộc trò chuyện|A2','keep a conversation going|duy trì cuộc trò chuyện|B1','join a social event|tham gia sự kiện xã hội|B1','meet new people|gặp người mới|A1',
  'show respect|thể hiện sự tôn trọng|A2','show appreciation|thể hiện sự trân trọng|B1','express gratitude|bày tỏ lòng biết ơn|B1','offer help|đề nghị giúp đỡ|A2','ask for advice|xin lời khuyên|A2','give emotional support|hỗ trợ tinh thần|B2',

  'keep the house clean|giữ nhà sạch sẽ|A2','clean the house|dọn nhà|A1','do the laundry|giặt quần áo|A1','wash the dishes|rửa bát|A1','take out the trash|đổ rác|A1','make the bed|dọn giường|A1',
  'do the housework|làm việc nhà|A2','clean up the kitchen|dọn bếp|A2','tidy up the room|dọn gọn phòng|A2','make a mess|bày bừa|A2','keep the room tidy|giữ phòng gọn gàng|A2','household chores|việc nhà|B1',
  'pay the rent|trả tiền thuê nhà|A2','pay utility bills|trả hóa đơn tiện ích|B1','renew a lease|gia hạn hợp đồng thuê|B2','move into a new apartment|chuyển vào căn hộ mới|B1','move out of a house|chuyển khỏi nhà|B1','rent an apartment|thuê căn hộ|A2',

  'buy groceries|mua đồ tạp hóa|A2','go shopping|đi mua sắm|A1','make a purchase|thực hiện mua hàng|B1','compare prices|so sánh giá|A2','look for a bargain|tìm món hời|B1','get a discount|được giảm giá|A2',
  'place an order|đặt hàng|B1','cancel an order|hủy đơn hàng|A2','track an order|theo dõi đơn hàng|B1','receive an order|nhận đơn hàng|A2','return a product|trả lại sản phẩm|A2','request a refund|yêu cầu hoàn tiền|B1',
  'customer service|dịch vụ khách hàng|A2','store policy|chính sách cửa hàng|B1','return policy|chính sách đổi trả|B1','reasonable price|giá hợp lý|B1','high demand|nhu cầu cao|B1','limited supply|nguồn cung hạn chế|B1',

  'rain heavily|mưa to|A2','rain lightly|mưa nhỏ|A2','snow heavily|tuyết rơi dày|B1','strong wind|gió mạnh|A2','heavy rain|mưa lớn|A2','clear sky|bầu trời quang|A2',
  'hot weather|thời tiết nóng|A1','cold weather|thời tiết lạnh|A1','warm weather|thời tiết ấm|A1','mild weather|thời tiết ôn hòa|B1','bad weather|thời tiết xấu|A1','extreme weather|thời tiết khắc nghiệt|B1',
  'weather forecast|dự báo thời tiết|A2','check the forecast|xem dự báo|A2','temperature rises|nhiệt độ tăng|A2','temperature drops|nhiệt độ giảm|A2','climate change|biến đổi khí hậu|B1','global warming|nóng lên toàn cầu|B1',
  'reduce emissions|giảm khí thải|B1','protect the environment|bảo vệ môi trường|A2','save energy|tiết kiệm năng lượng|A2','save water|tiết kiệm nước|A2','recycle waste|tái chế rác thải|B1','reduce plastic use|giảm sử dụng nhựa|B1',

  'make a phone call|gọi điện thoại|A2','answer the phone|nghe điện thoại|A1','miss a call|nhỡ cuộc gọi|A2','leave a voicemail|để lại thư thoại|B1','send a text message|gửi tin nhắn|A1','reply to a message|trả lời tin nhắn|A1',
  'post a comment|đăng bình luận|A2','share a photo|chia sẻ ảnh|A1','watch a video|xem video|A1','listen to music|nghe nhạc|A1','read the news|đọc tin tức|A1','follow the news|theo dõi tin tức|A2',
  'social media account|tài khoản mạng xã hội|A2','online community|cộng đồng trực tuyến|B1','news report|bản tin|A2','breaking news|tin nóng|B1','public opinion|dư luận công chúng|B2','media coverage|độ phủ truyền thông|B2',

  'physical health|sức khỏe thể chất|B1','mental well-being|sức khỏe tinh thần|B2','seek medical advice|tìm lời khuyên y tế|B1','make an appointment|đặt lịch hẹn|A2','see a doctor|đi khám bác sĩ|A1','take medicine|uống thuốc|A1',
  'follow medical advice|làm theo lời khuyên y tế|B1','recover from an illness|hồi phục sau bệnh|B1','suffer from pain|chịu đựng cơn đau|B1','experience symptoms|có triệu chứng|B1','show symptoms|biểu hiện triệu chứng|B1','medical history|tiền sử bệnh|B2',
  'healthy lifestyle|lối sống lành mạnh|B1','regular check-up|khám sức khỏe định kỳ|B1','public health|y tế công cộng|B1','health insurance|bảo hiểm sức khỏe|B1','medical treatment|điều trị y tế|B1','emergency care|chăm sóc cấp cứu|B2',

  'take a risk|mạo hiểm|A2','avoid a risk|tránh rủi ro|B1','face a risk|đối mặt rủi ro|B1','potential risk|rủi ro tiềm ẩn|B1','serious consequence|hậu quả nghiêm trọng|B1','unexpected consequence|hậu quả ngoài dự kiến|B2',
  'obey the law|tuân thủ pháp luật|A2','break the law|vi phạm pháp luật|A2','legal advice|tư vấn pháp lý|B1','legal requirement|yêu cầu pháp lý|B2','legal action|hành động pháp lý|B2','court decision|phán quyết của tòa|B1',
  'public service|dịch vụ công|B1','government agency|cơ quan chính phủ|B1','public policy|chính sách công|B2','national economy|nền kinh tế quốc gia|B1','economic growth|tăng trưởng kinh tế|B1','economic crisis|khủng hoảng kinh tế|B1',

  'conduct an experiment|tiến hành thí nghiệm|B2','collect samples|thu thập mẫu|B1','analyze results|phân tích kết quả|B1','scientific evidence|bằng chứng khoa học|B2','research method|phương pháp nghiên cứu|B2','scientific method|phương pháp khoa học|B2',
  'solve a problem|giải quyết vấn đề|A2','find an answer|tìm câu trả lời|A1','make an observation|đưa ra quan sát|B2','test a theory|kiểm chứng lý thuyết|B2','support a hypothesis|hỗ trợ giả thuyết|B2','reach a conclusion|đi đến kết luận|B1',

  'play a sport|chơi thể thao|A2','play football|chơi bóng đá|A1','go swimming|đi bơi|A1','go hiking|đi leo núi / đi bộ đường dài|A2','take part in a competition|tham gia cuộc thi|B1','win a match|thắng một trận đấu|A2',
  'lose a match|thua một trận đấu|A2','break a record|phá kỷ lục|B1','train hard|tập luyện chăm chỉ|B1','improve your skills|cải thiện kỹ năng|A2','team spirit|tinh thần đồng đội|B1','competitive spirit|tinh thần cạnh tranh|B1',

  'feel happy|cảm thấy vui|A1','feel sad|cảm thấy buồn|A1','feel excited|cảm thấy hào hứng|A2','feel nervous|cảm thấy lo lắng|A2','feel confident|cảm thấy tự tin|A2','feel disappointed|cảm thấy thất vọng|B1',
  'have mixed feelings|có cảm xúc lẫn lộn|B2','express feelings|bày tỏ cảm xúc|B1','control your emotions|kiểm soát cảm xúc|B1','deal with stress|đối phó với căng thẳng|B1','relieve stress|giảm căng thẳng|B1','build confidence|xây dựng sự tự tin|B1'
]));

export function lifeSuggestionItems(){return LIFE_SUGGESTIONS.slice();}
