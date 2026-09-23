import {EXPANDED_SUGGESTIONS} from './collocation-library.mjs';
import {LIFE_SUGGESTIONS} from './collocation-library-life.mjs';
import {inferCefr} from './vocabulary-core.mjs';
export const CONFUSIONS=Object.freeze({
  'make a deadline':{better:'meet a deadline / beat a deadline',message:'Không dùng “make a deadline” khi muốn nói hoàn thành đúng hạn.'},
  'do a decision':{better:'make a decision',message:'Collocation chuẩn là “make a decision”, không phải “do a decision”.'},
  'make a research':{better:'do research / conduct research',message:'Với “research”, dùng “do/conduct research” tự nhiên hơn.'},
  'do a meeting':{better:'have a meeting / hold a meeting',message:'“Do a meeting” không tự nhiên trong ngữ cảnh công việc.'}
});

export const SYNONYMS=Object.freeze({
  allow:['permit','authorize'],make:['create','produce'],improve:['enhance','optimize'],use:['utilize','apply'],
  help:['assist','support'],start:['begin','launch'],show:['display','present'],need:['require'],
  fix:['resolve','repair'],build:['develop','create'],change:['modify','alter'],check:['verify','review'],
  choose:['select','pick'],keep:['maintain','retain'],reduce:['decrease','minimize'],increase:['raise','boost'],
  explain:['clarify','elaborate'],provide:['supply','offer'],support:['assist','back'],ensure:['guarantee','make sure']
});

const entries=(...pairs)=>pairs.map(pair=>{
  const i=pair.indexOf('|');
  return {c:i<0?pair.trim():pair.slice(0,i).trim(),v:i<0?'':pair.slice(i+1).trim()};
});

export const COLLOCATION_BANK=Object.freeze({
  allow:entries(
    'allow access|cho phép truy cập','allow customers to|cho phép khách hàng làm gì','allow users to|cho phép người dùng làm gì',
    'allow someone to|cho phép ai đó làm gì','allow time for|dành đủ thời gian cho','allow for|tính đến / bao gồm'
  ),
  make:entries(
    'make a decision|đưa ra quyết định','make a plan|lập kế hoạch','make progress|có tiến triển',
    'make a mistake|mắc lỗi','make sure|đảm bảo / chắc chắn','make an effort|nỗ lực'
  ),
  do:entries(
    'do business|kinh doanh / làm ăn','do research|tiến hành nghiên cứu','do your best|cố gắng hết sức',
    'do the work|làm công việc','do a task|thực hiện một nhiệm vụ','do business with|giao dịch với'
  ),
  take:entries(
    'take action|hành động','take ownership|chịu trách nhiệm chính','take responsibility|chịu trách nhiệm',
    'take a break|nghỉ giải lao','take part in|tham gia','take into account|tính đến / cân nhắc'
  ),
  meet:entries(
    'meet a deadline|đáp ứng thời hạn','meet a requirement|đáp ứng yêu cầu','meet a need|đáp ứng nhu cầu',
    'meet a target|đạt mục tiêu / chỉ tiêu','meet expectations|đáp ứng kỳ vọng','meet a standard|đạt tiêu chuẩn'
  ),
  pay:entries(
    'pay attention to|chú ý đến','pay a fee|trả phí','pay a bill|thanh toán hóa đơn',
    'pay for|trả tiền cho','pay off|thanh toán hết / mang lại kết quả'
  ),
  raise:entries(
    'raise a concern|nêu mối quan ngại','raise an issue|nêu vấn đề','raise a question|đặt câu hỏi',
    'raise awareness|nâng cao nhận thức','raise funds|gây quỹ'
  ),
  gain:entries(
    'gain experience|tích lũy kinh nghiệm','gain access|có được quyền truy cập','gain trust|giành được niềm tin',
    'gain insight|có thêm hiểu biết sâu','gain confidence|tăng sự tự tin'
  ),
  improve:entries(
    'improve user experience|cải thiện trải nghiệm người dùng','improve performance|cải thiện hiệu suất',
    'improve communication|cải thiện giao tiếp','improve efficiency|cải thiện hiệu quả',
    'improve quality|cải thiện chất lượng'
  ),
  reach:entries(
    'reach a goal|đạt mục tiêu','reach an agreement|đạt được thỏa thuận','reach a decision|đi đến quyết định',
    'reach a target|đạt chỉ tiêu','reach an audience|tiếp cận khán giả / người dùng'
  ),
  provide:entries(
    'provide support|cung cấp hỗ trợ','provide information|cung cấp thông tin','provide feedback|cung cấp phản hồi',
    'provide access|cung cấp quyền truy cập','provide a service|cung cấp dịch vụ'
  ),
  have:entries(
    'have access to|có quyền truy cập','have a meeting|có / tổ chức cuộc họp','have an impact|có tác động',
    'have experience|có kinh nghiệm','have an opportunity|có cơ hội','have a problem|gặp vấn đề'
  ),
  give:entries(
    'give feedback|đưa ra phản hồi','give advice|đưa ra lời khuyên','give permission|cho phép',
    'give priority to|ưu tiên cho','give an example|đưa ra ví dụ','give an update|cập nhật thông tin'
  ),
  get:entries(
    'get access to|có quyền truy cập','get approval|được phê duyệt','get permission|được phép',
    'get feedback|nhận phản hồi','get results|nhận kết quả','get support|nhận hỗ trợ'
  ),
  set:entries(
    'set a goal|đặt mục tiêu','set a deadline|đặt thời hạn','set a priority|đặt ưu tiên',
    'set a budget|đặt ngân sách','set a standard|đặt tiêu chuẩn','set expectations|đặt kỳ vọng'
  ),
  keep:entries(
    'keep track of|theo dõi','keep in mind|ghi nhớ','keep up with|theo kịp',
    'keep a record|lưu hồ sơ / bản ghi','keep someone informed|giữ ai đó được cập nhật'
  ),
  use:entries(
    'use a tool|sử dụng công cụ','use data|sử dụng dữ liệu','use a template|sử dụng mẫu',
    'use a system|sử dụng hệ thống','use a feature|sử dụng tính năng','use best practices|áp dụng thông lệ tốt'
  ),
  work:entries(
    'work on a project|làm việc trên dự án','work with a team|làm việc với đội nhóm',
    'work closely with|phối hợp chặt chẽ với','work remotely|làm việc từ xa','work under pressure|làm việc dưới áp lực'
  ),
  project:entries(
    'manage a project|quản lý dự án','lead a project|dẫn dắt dự án','complete a project|hoàn thành dự án',
    'launch a project|khởi động dự án','project scope|phạm vi dự án','project timeline|tiến độ dự án'
  ),
  deadline:entries(
    'meet a deadline|đáp ứng thời hạn','miss a deadline|trễ hạn','set a deadline|đặt thời hạn',
    'extend a deadline|gia hạn','tight deadline|thời hạn gấp','approaching deadline|thời hạn đang đến gần'
  ),
  requirement:entries(
    'meet a requirement|đáp ứng yêu cầu','define a requirement|xác định yêu cầu','gather requirements|thu thập yêu cầu',
    'business requirement|yêu cầu nghiệp vụ','technical requirement|yêu cầu kỹ thuật','compliance requirement|yêu cầu tuân thủ'
  ),
  feedback:entries(
    'provide feedback|cung cấp phản hồi','collect feedback|thu thập phản hồi','gather feedback|thu thập phản hồi',
    'receive feedback|nhận phản hồi','user feedback|phản hồi người dùng','feedback form|biểu mẫu phản hồi'
  ),
  decision:entries(
    'make a decision|đưa ra quyết định','reach a decision|đi đến quyết định','final decision|quyết định cuối cùng',
    'informed decision|quyết định có cân nhắc thông tin','business decision|quyết định kinh doanh','decision-making process|quy trình ra quyết định'
  ),
  issue:entries(
    'raise an issue|nêu vấn đề','resolve an issue|giải quyết vấn đề','address an issue|xử lý vấn đề',
    'identify an issue|xác định vấn đề','technical issue|vấn đề kỹ thuật','potential issue|vấn đề tiềm ẩn'
  ),
  risk:entries(
    'assess risk|đánh giá rủi ro','manage risk|quản lý rủi ro','reduce risk|giảm rủi ro',
    'mitigate risk|giảm thiểu rủi ro','high risk|rủi ro cao','risk assessment|đánh giá rủi ro'
  ),
  user:entries(
    'user experience|trải nghiệm người dùng','user interface|giao diện người dùng','user research|nghiên cứu người dùng',
    'user feedback|phản hồi người dùng','user journey|hành trình người dùng','user needs|nhu cầu người dùng'
  ),
  experience:entries(
    'user experience|trải nghiệm người dùng','customer experience|trải nghiệm khách hàng',
    'work experience|kinh nghiệm làm việc','hands-on experience|kinh nghiệm thực tế',
    'gain experience|tích lũy kinh nghiệm','relevant experience|kinh nghiệm liên quan'
  ),
  customer:entries(
    'customer needs|nhu cầu khách hàng','customer feedback|phản hồi khách hàng','customer support|hỗ trợ khách hàng',
    'customer experience|trải nghiệm khách hàng','customer satisfaction|mức độ hài lòng của khách hàng','customer journey|hành trình khách hàng'
  ),
  payment:entries(
    'make a payment|thanh toán','process a payment|xử lý thanh toán','payment method|phương thức thanh toán',
    'payment processing|xử lý thanh toán','payment confirmation|xác nhận thanh toán','payment history|lịch sử thanh toán'
  ),
  account:entries(
    'create an account|tạo tài khoản','access an account|truy cập tài khoản','close an account|đóng tài khoản',
    'account balance|số dư tài khoản','account information|thông tin tài khoản','account holder|chủ tài khoản'
  ),
  claim:entries(
    'file a claim|nộp yêu cầu bồi thường','process a claim|xử lý yêu cầu bồi thường','approve a claim|phê duyệt yêu cầu bồi thường',
    'reject a claim|từ chối yêu cầu bồi thường','insurance claim|yêu cầu bồi thường bảo hiểm','claim form|biểu mẫu yêu cầu bồi thường'
  ),
  policy:entries(
    'insurance policy|hợp đồng bảo hiểm','policy holder|người tham gia / chủ hợp đồng','policy terms|điều khoản hợp đồng',
    'renew a policy|gia hạn hợp đồng','policy coverage|phạm vi bảo hiểm','policy number|số hợp đồng'
  ),
  premium:entries(
    'pay a premium|đóng phí bảo hiểm','annual premium|phí bảo hiểm hằng năm','monthly premium|phí bảo hiểm hằng tháng',
    'premium payment|khoản thanh toán phí bảo hiểm','premium rate|mức phí bảo hiểm','premium increase|tăng phí bảo hiểm'
  ),
  transaction:entries(
    'process a transaction|xử lý giao dịch','authorize a transaction|phê duyệt giao dịch','transaction history|lịch sử giao dịch',
    'transaction fee|phí giao dịch','online transaction|giao dịch trực tuyến','transaction status|trạng thái giao dịch'
  ),
  security:entries(
    'security risk|rủi ro bảo mật','security measure|biện pháp bảo mật','security check|kiểm tra bảo mật',
    'security policy|chính sách bảo mật','data security|bảo mật dữ liệu','security breach|sự cố vi phạm bảo mật'
  ),
  compliance:entries(
    'regulatory compliance|tuân thủ quy định','ensure compliance|đảm bảo tuân thủ','compliance requirement|yêu cầu tuân thủ',
    'compliance risk|rủi ro tuân thủ','compliance check|kiểm tra tuân thủ','compliance team|đội tuân thủ'
  ),
  performance:entries(
    'improve performance|cải thiện hiệu suất','monitor performance|theo dõi hiệu suất','measure performance|đo hiệu suất',
    'system performance|hiệu suất hệ thống','performance issue|vấn đề hiệu suất','high performance|hiệu suất cao'
  ),
  feature:entries(
    'launch a feature|ra mắt tính năng','add a feature|thêm tính năng','test a feature|kiểm thử tính năng',
    'new feature|tính năng mới','feature request|yêu cầu tính năng','feature adoption|mức độ sử dụng tính năng'
  ),
  design:entries(
    'design a solution|thiết kế giải pháp','design system|hệ thống thiết kế','design process|quy trình thiết kế',
    'user-centered design|thiết kế lấy người dùng làm trung tâm','responsive design|thiết kế đáp ứng','visual design|thiết kế trực quan'
  ),
  research:entries(
    'conduct research|tiến hành nghiên cứu','do research|tiến hành nghiên cứu','user research|nghiên cứu người dùng',
    'market research|nghiên cứu thị trường','research findings|kết quả nghiên cứu','research method|phương pháp nghiên cứu'
  ),
  analysis:entries(
    'conduct an analysis|thực hiện phân tích','data analysis|phân tích dữ liệu','detailed analysis|phân tích chi tiết',
    'financial analysis|phân tích tài chính','user analysis|phân tích người dùng','analysis report|báo cáo phân tích'
  ),
  data:entries(
    'collect data|thu thập dữ liệu','analyze data|phân tích dữ liệu','data quality|chất lượng dữ liệu',
    'data source|nguồn dữ liệu','data security|bảo mật dữ liệu','customer data|dữ liệu khách hàng'
  ),
  system:entries(
    'system performance|hiệu suất hệ thống','system access|quyền truy cập hệ thống','system update|cập nhật hệ thống',
    'system requirements|yêu cầu hệ thống','system integration|tích hợp hệ thống','system error|lỗi hệ thống'
  ),
  app:entries(
    'mobile app|ứng dụng di động','banking app|ứng dụng ngân hàng','app feature|tính năng ứng dụng',
    'app performance|hiệu suất ứng dụng','app design|thiết kế ứng dụng','launch an app|ra mắt ứng dụng'
  ),
  website:entries(
    'design a website|thiết kế website','build a website|xây dựng website','website traffic|lưu lượng truy cập website',
    'website performance|hiệu suất website','website content|nội dung website','website accessibility|khả năng tiếp cận website'
  ),
  meeting:entries(
    'have a meeting|có / tổ chức cuộc họp','hold a meeting|tổ chức cuộc họp','schedule a meeting|lên lịch họp',
    'attend a meeting|tham dự cuộc họp','join a meeting|tham gia cuộc họp','meeting agenda|chương trình họp'
  ),
  report:entries(
    'write a report|viết báo cáo','prepare a report|chuẩn bị báo cáo','submit a report|nộp báo cáo',
    'annual report|báo cáo thường niên','financial report|báo cáo tài chính','progress report|báo cáo tiến độ'
  ),
  update:entries(
    'provide an update|cung cấp cập nhật','give an update|cập nhật thông tin','status update|cập nhật trạng thái',
    'regular update|cập nhật định kỳ','project update|cập nhật dự án','software update|bản cập nhật phần mềm'
  ),
  support:entries(
    'provide support|cung cấp hỗ trợ','technical support|hỗ trợ kỹ thuật','customer support|hỗ trợ khách hàng',
    'support team|đội hỗ trợ','ongoing support|hỗ trợ liên tục','support request|yêu cầu hỗ trợ'
  ),
  solution:entries(
    'find a solution|tìm giải pháp','provide a solution|đưa ra giải pháp','technical solution|giải pháp kỹ thuật',
    'cost-effective solution|giải pháp tiết kiệm chi phí','practical solution|giải pháp thực tế','design a solution|thiết kế giải pháp'
  ),
  strategy:entries(
    'develop a strategy|xây dựng chiến lược','business strategy|chiến lược kinh doanh','marketing strategy|chiến lược tiếp thị',
    'product strategy|chiến lược sản phẩm','long-term strategy|chiến lược dài hạn','implementation strategy|chiến lược triển khai'
  ),
  goal:entries(
    'set a goal|đặt mục tiêu','achieve a goal|đạt mục tiêu','reach a goal|đạt mục tiêu',
    'business goal|mục tiêu kinh doanh','strategic goal|mục tiêu chiến lược','long-term goal|mục tiêu dài hạn'
  ),
  target:entries(
    'meet a target|đạt chỉ tiêu','reach a target|đạt chỉ tiêu','set a target|đặt chỉ tiêu',
    'sales target|chỉ tiêu doanh số','target audience|đối tượng mục tiêu','target market|thị trường mục tiêu'
  ),
  quality:entries(
    'improve quality|cải thiện chất lượng','ensure quality|đảm bảo chất lượng','high quality|chất lượng cao',
    'quality control|kiểm soát chất lượng','quality standard|tiêu chuẩn chất lượng','quality issue|vấn đề chất lượng'
  ),
  cost:entries(
    'reduce costs|giảm chi phí','control costs|kiểm soát chi phí','operating costs|chi phí vận hành',
    'total cost|tổng chi phí','cost-effective solution|giải pháp tiết kiệm chi phí','additional cost|chi phí bổ sung'
  ),
  budget:entries(
    'set a budget|đặt ngân sách','allocate a budget|phân bổ ngân sách','stay within budget|nằm trong ngân sách',
    'budget planning|lập ngân sách','annual budget|ngân sách hằng năm','limited budget|ngân sách hạn chế'
  ),
  process:entries(
    'business process|quy trình nghiệp vụ','improve a process|cải thiện quy trình','streamline a process|tinh gọn quy trình',
    'automate a process|tự động hóa quy trình','approval process|quy trình phê duyệt','workflow process|quy trình luồng công việc'
  ),
  approval:entries(
    'get approval|được phê duyệt','seek approval|xin phê duyệt','final approval|phê duyệt cuối cùng',
    'management approval|phê duyệt của quản lý','approval process|quy trình phê duyệt','approval request|yêu cầu phê duyệt'
  ),
  launch:entries(
    'launch a product|ra mắt sản phẩm','launch a feature|ra mắt tính năng','launch a campaign|khởi động chiến dịch',
    'product launch|lễ / đợt ra mắt sản phẩm','soft launch|ra mắt thử nghiệm','official launch|ra mắt chính thức'
  ),
  build:entries(
    'build a product|xây dựng sản phẩm','build a team|xây dựng đội ngũ','build trust|xây dựng niềm tin',
    'build a prototype|xây dựng nguyên mẫu','build a relationship|xây dựng mối quan hệ','build a system|xây dựng hệ thống'
  ),
  develop:entries(
    'develop a strategy|xây dựng chiến lược','develop a product|phát triển sản phẩm','develop a feature|phát triển tính năng',
    'develop a solution|phát triển giải pháp','develop skills|phát triển kỹ năng','develop a prototype|phát triển nguyên mẫu'
  ),
  create:entries(
    'create a plan|tạo kế hoạch','create value|tạo giá trị','create an account|tạo tài khoản',
    'create a prototype|tạo nguyên mẫu','create a report|tạo báo cáo','create an opportunity|tạo cơ hội'
  ),
  manage:entries(
    'manage a project|quản lý dự án','manage risk|quản lý rủi ro','manage a team|quản lý đội ngũ',
    'manage expectations|quản lý kỳ vọng','manage resources|quản lý nguồn lực','manage change|quản lý thay đổi'
  ),
  review:entries(
    'review a document|xem xét tài liệu','review a proposal|xem xét đề xuất','review a process|xem xét quy trình',
    'code review|xem xét mã nguồn','design review|review thiết kế','performance review|đánh giá hiệu suất'
  ),
  check:entries(
    'check the status|kiểm tra trạng thái','check the details|kiểm tra chi tiết','check the data|kiểm tra dữ liệu',
    'check for errors|kiểm tra lỗi','background check|kiểm tra lý lịch','quality check|kiểm tra chất lượng'
  ),
  resolve:entries(
    'resolve an issue|giải quyết vấn đề','resolve a conflict|giải quyết xung đột','resolve a problem|giải quyết vấn đề',
    'resolve a dispute|giải quyết tranh chấp','quickly resolve|giải quyết nhanh','resolve a complaint|giải quyết khiếu nại'
  ),
  address:entries(
    'address an issue|xử lý một vấn đề','address a concern|giải quyết mối quan ngại','address a problem|xử lý vấn đề',
    'address customer needs|đáp ứng nhu cầu khách hàng','address a gap|xử lý khoảng thiếu hụt','address a requirement|đáp ứng yêu cầu'
  ),
  reduce:entries(
    'reduce costs|giảm chi phí','reduce risk|giảm rủi ro','reduce errors|giảm lỗi',
    'reduce complexity|giảm độ phức tạp','reduce waiting time|giảm thời gian chờ','reduce workload|giảm khối lượng công việc'
  ),
  increase:entries(
    'increase efficiency|tăng hiệu quả','increase revenue|tăng doanh thu','increase productivity|tăng năng suất',
    'increase engagement|tăng mức độ tương tác','increase adoption|tăng mức độ sử dụng','increase capacity|tăng năng lực'
  ),
  improve_extra:entries(
    'improve user experience|cải thiện trải nghiệm người dùng','improve performance|cải thiện hiệu suất',
    'improve communication|cải thiện giao tiếp','improve efficiency|cải thiện hiệu quả','improve quality|cải thiện chất lượng',
    'improve accessibility|cải thiện khả năng tiếp cận'
  ),
  optimize:entries(
    'optimize performance|tối ưu hiệu suất','optimize a process|tối ưu quy trình','optimize user experience|tối ưu trải nghiệm người dùng',
    'optimize conversion|tối ưu chuyển đổi','optimize costs|tối ưu chi phí','optimize workflow|tối ưu luồng công việc'
  ),
  design_extra:entries(
    'design a solution|thiết kế giải pháp','design system|hệ thống thiết kế','design process|quy trình thiết kế',
    'user-centered design|thiết kế lấy người dùng làm trung tâm','responsive design|thiết kế đáp ứng','design a prototype|thiết kế nguyên mẫu'
  ),
  journey:entries(
    'user journey|hành trình người dùng','customer journey|hành trình khách hàng','customer journey map|bản đồ hành trình khách hàng',
    'user journey map|bản đồ hành trình người dùng','end-to-end journey|hành trình đầu-cuối','journey stage|giai đoạn hành trình'
  ),
  prototype:entries(
    'build a prototype|xây dựng nguyên mẫu','create a prototype|tạo nguyên mẫu','test a prototype|kiểm thử nguyên mẫu',
    'interactive prototype|nguyên mẫu tương tác','high-fidelity prototype|nguyên mẫu độ trung thực cao','prototype design|thiết kế nguyên mẫu'
  ),
  usability:entries(
    'usability testing|kiểm thử khả dụng','improve usability|cải thiện khả dụng','usability issue|vấn đề khả dụng',
    'usability study|nghiên cứu khả dụng','good usability|tính khả dụng tốt','usability problem|vấn đề khả dụng'
  ),
  accessibility:entries(
    'improve accessibility|cải thiện khả năng tiếp cận','web accessibility|khả năng tiếp cận web',
    'accessibility standard|tiêu chuẩn khả năng tiếp cận','accessibility issue|vấn đề khả năng tiếp cận',
    'accessible design|thiết kế dễ tiếp cận','accessibility testing|kiểm thử khả năng tiếp cận'
  ),
  interface:entries(
    'user interface|giao diện người dùng','interface design|thiết kế giao diện','interface element|thành phần giao diện',
    'interface layout|bố cục giao diện','interface consistency|tính nhất quán giao diện','interface pattern|mẫu giao diện'
  ),
  content:entries(
    'create content|tạo nội dung','content strategy|chiến lược nội dung','content design|thiết kế nội dung',
    'content management|quản lý nội dung','content quality|chất lượng nội dung','content update|cập nhật nội dung'
  ),
  market:entries(
    'market research|nghiên cứu thị trường','target market|thị trường mục tiêu','market share|thị phần',
    'market demand|nhu cầu thị trường','market trend|xu hướng thị trường','market analysis|phân tích thị trường'
  ),
  product:entries(
    'product strategy|chiến lược sản phẩm','product design|thiết kế sản phẩm','product development|phát triển sản phẩm',
    'product launch|ra mắt sản phẩm','product roadmap|lộ trình sản phẩm','product feature|tính năng sản phẩm'
  ),
  roadmap:entries(
    'product roadmap|lộ trình sản phẩm','project roadmap|lộ trình dự án','technology roadmap|lộ trình công nghệ',
    'roadmap planning|lập lộ trình','long-term roadmap|lộ trình dài hạn','roadmap update|cập nhật lộ trình'
  ),
  technology:entries(
    'new technology|công nghệ mới','emerging technology|công nghệ mới nổi','technology solution|giải pháp công nghệ',
    'technology stack|ngăn xếp công nghệ','technology trend|xu hướng công nghệ','technology adoption|mức độ áp dụng công nghệ'
  ),
  software:entries(
    'software development|phát triển phần mềm','software update|bản cập nhật phần mềm','software system|hệ thống phần mềm',
    'software tool|công cụ phần mềm','software testing|kiểm thử phần mềm','software release|bản phát hành phần mềm'
  ),
  api:entries(
    'API access|quyền truy cập API','API request|yêu cầu API','API response|phản hồi API',
    'API endpoint|điểm cuối API','API integration|tích hợp API','API documentation|tài liệu API'
  ),
  database:entries(
    'access a database|truy cập cơ sở dữ liệu','database system|hệ thống cơ sở dữ liệu','database access|quyền truy cập cơ sở dữ liệu',
    'database query|truy vấn cơ sở dữ liệu','database security|bảo mật cơ sở dữ liệu','customer database|cơ sở dữ liệu khách hàng'
  ),
  banking:entries(
    'online banking|ngân hàng trực tuyến','retail banking|ngân hàng bán lẻ','banking service|dịch vụ ngân hàng',
    'banking app|ứng dụng ngân hàng','banking customer|khách hàng ngân hàng','digital banking|ngân hàng số'
  ),
  insurance:entries(
    'insurance policy|hợp đồng bảo hiểm','insurance claim|yêu cầu bồi thường bảo hiểm','insurance coverage|phạm vi bảo hiểm',
    'insurance premium|phí bảo hiểm','insurance product|sản phẩm bảo hiểm','insurance company|công ty bảo hiểm'
  ),
  collaborate:entries(
    'collaborate with a team|phối hợp với một đội nhóm','collaborate closely|phối hợp chặt chẽ','cross-functional collaboration|phối hợp liên phòng ban',
    'collaborate on a project|phối hợp trong một dự án','collaborate with stakeholders|phối hợp với các bên liên quan'
  ),
  communicate:entries(
    'communicate clearly|giao tiếp rõ ràng','communicate with customers|giao tiếp với khách hàng','communicate effectively|giao tiếp hiệu quả',
    'communicate expectations|truyền đạt kỳ vọng','communicate a message|truyền đạt thông điệp'
  ),
  deliver:entries(
    'deliver results|mang lại kết quả','deliver a project|bàn giao / hoàn thành dự án','deliver value|tạo ra giá trị',
    'deliver on time|bàn giao đúng hạn','deliver a solution|cung cấp giải pháp'
  ),
  launch_extra:entries(
    'launch a product|ra mắt sản phẩm','launch a feature|ra mắt tính năng','launch a campaign|khởi động chiến dịch',
    'product launch|đợt ra mắt sản phẩm','launch a new service|ra mắt dịch vụ mới'
  ),
  implement:entries(
    'implement a solution|triển khai giải pháp','implement a strategy|triển khai chiến lược','implement a process|triển khai quy trình',
    'implement changes|triển khai thay đổi','implement a feature|triển khai tính năng'
  ),
  evaluate:entries(
    'evaluate a solution|đánh giá giải pháp','evaluate performance|đánh giá hiệu suất','evaluate results|đánh giá kết quả',
    'evaluate options|đánh giá các lựa chọn','evaluate a proposal|đánh giá đề xuất'
  ),
  identify:entries(
    'identify a problem|xác định vấn đề','identify a need|xác định nhu cầu','identify an opportunity|xác định cơ hội',
    'identify a risk|xác định rủi ro','identify a trend|xác định xu hướng'
  ),
  solve:entries(
    'solve a problem|giải quyết vấn đề','solve an issue|giải quyết vấn đề','solve a challenge|giải quyết thách thức',
    'solve a technical problem|giải quyết vấn đề kỹ thuật','solve a customer problem|giải quyết vấn đề của khách hàng'
  ),
  build_extra:entries(
    'build a product|xây dựng sản phẩm','build a team|xây dựng đội ngũ','build trust|xây dựng niềm tin',
    'build a prototype|xây dựng nguyên mẫu','build a relationship|xây dựng mối quan hệ'
  ),
  organize:entries(
    'organize a meeting|tổ chức cuộc họp','organize an event|tổ chức sự kiện','organize information|sắp xếp thông tin',
    'organize a workshop|tổ chức workshop','organize a project|tổ chức dự án'
  ),
  schedule:entries(
    'schedule a meeting|lên lịch họp','schedule a call|lên lịch cuộc gọi','schedule an appointment|đặt lịch hẹn',
    'schedule a task|lên lịch nhiệm vụ','schedule a review|lên lịch review'
  ),
  attend:entries(
    'attend a meeting|tham dự cuộc họp','attend a workshop|tham dự workshop','attend a conference|tham dự hội nghị',
    'attend a training session|tham dự buổi đào tạo','attend an event|tham dự sự kiện'
  ),
  discuss:entries(
    'discuss an issue|thảo luận vấn đề','discuss a proposal|thảo luận đề xuất','discuss a solution|thảo luận giải pháp',
    'discuss the results|thảo luận kết quả','discuss next steps|thảo luận bước tiếp theo'
  ),
  present:entries(
    'present a proposal|trình bày đề xuất','present the results|trình bày kết quả','present an idea|trình bày ý tưởng',
    'present a solution|trình bày giải pháp','present findings|trình bày phát hiện / kết quả'
  ),
  propose:entries(
    'propose a solution|đề xuất giải pháp','propose a plan|đề xuất kế hoạch','propose changes|đề xuất thay đổi',
    'propose an idea|đề xuất ý tưởng','propose a new approach|đề xuất cách tiếp cận mới'
  ),
  approve:entries(
    'approve a request|phê duyệt yêu cầu','approve a claim|phê duyệt yêu cầu bồi thường','approve a payment|phê duyệt thanh toán',
    'approve a proposal|phê duyệt đề xuất','approve a transaction|phê duyệt giao dịch'
  ),
  reject:entries(
    'reject a request|từ chối yêu cầu','reject a claim|từ chối yêu cầu bồi thường','reject a proposal|từ chối đề xuất',
    'reject an application|từ chối đơn đăng ký','reject a transaction|từ chối giao dịch'
  ),
  monitor:entries(
    'monitor performance|theo dõi hiệu suất','monitor progress|theo dõi tiến độ','monitor activity|theo dõi hoạt động',
    'monitor a system|theo dõi hệ thống','monitor results|theo dõi kết quả'
  ),
  measure:entries(
    'measure performance|đo hiệu suất','measure impact|đo tác động','measure success|đo mức độ thành công',
    'measure results|đo kết quả','measure customer satisfaction|đo mức độ hài lòng khách hàng'
  ),
  prioritize:entries(
    'prioritize tasks|ưu tiên nhiệm vụ','prioritize work|ưu tiên công việc','prioritize user needs|ưu tiên nhu cầu người dùng',
    'prioritize issues|ưu tiên vấn đề','prioritize features|ưu tiên tính năng'
  ),
  estimate:entries(
    'estimate costs|ước tính chi phí','estimate effort|ước tính công sức','estimate time|ước tính thời gian',
    'estimate a budget|ước tính ngân sách','estimate project duration|ước tính thời lượng dự án'
  ),
  allocate:entries(
    'allocate resources|phân bổ nguồn lực','allocate a budget|phân bổ ngân sách','allocate time|phân bổ thời gian',
    'allocate tasks|phân công nhiệm vụ','allocate funding|phân bổ nguồn vốn'
  ),
  resource:entries(
    'allocate resources|phân bổ nguồn lực','human resources|nguồn nhân lực','financial resources|nguồn lực tài chính',
    'limited resources|nguồn lực hạn chế','resource planning|lập kế hoạch nguồn lực'
  ),
  stakeholder:entries(
    'key stakeholder|bên liên quan chính','stakeholder needs|nhu cầu của bên liên quan','stakeholder feedback|phản hồi của bên liên quan',
    'engage stakeholders|thu hút / làm việc với các bên liên quan','stakeholder management|quản lý các bên liên quan'
  ),
  requirement_extra:entries(
    'meet a requirement|đáp ứng yêu cầu','define a requirement|xác định yêu cầu','gather requirements|thu thập yêu cầu',
    'business requirement|yêu cầu nghiệp vụ','technical requirement|yêu cầu kỹ thuật','compliance requirement|yêu cầu tuân thủ'
  )
});

export const SUGGESTION_BANK=Object.freeze(Object.fromEntries(
  Object.entries(COLLOCATION_BANK).map(([head,items])=>[head,items.map(item=>item.c)])
));

function uniqueByPhrase(items){
  const seen=new Set();
  return (Array.isArray(items)?items:[]).filter(item=>{
    const phrase=String(item?.c??item??'').trim(),key=phrase.toLowerCase();
    if(!key||seen.has(key))return false;
    seen.add(key);return true;
  });
}
export function normalizeSmartInput(value){return String(value??'').trim().toLowerCase().replace(/[.,!?;:]+$/,'')}
export function fastSuggestionItems(value){
  const q=normalizeSmartInput(value);
  if(q.length<2)return [];
  const head=q.split(/\s+/)[0]||'';
  const local=COLLOCATION_BANK[head]||[];
  const global=Object.values(COLLOCATION_BANK).flat();
  const source=[...local,...global,...EXPANDED_SUGGESTIONS,...LIFE_SUGGESTIONS];
  const prefix=source.filter(item=>{
    const low=item.c.toLowerCase();
    return low.startsWith(q)&&low!==q;
  });
  const matches=uniqueByPhrase(prefix).slice(0,60);
  return matches.map(item=>({...item,cefr:String(item.cefr||inferCefr(item.c)||'').trim().toUpperCase()}));
}
export function fastSuggestions(value){return fastSuggestionItems(value).map(item=>item.c)}
export function synonymsFor(value){
  const head=normalizeSmartInput(value).split(/\s+/).pop()||'';
  return (SYNONYMS[head]||[]).slice(0,3);
}

export function ruleRefinement(value){
  const key=normalizeSmartInput(value),hit=CONFUSIONS[key];
  return hit?{better:hit.better,warning:hit.message}:null;
}

export function refinementPrompt(rows){
  return JSON.stringify((Array.isArray(rows)?rows:[]).map((row,index)=>({
    index:index+1,id:String(row?.id??''),collocation:String(row?.c??'').trim()
  })));
}
