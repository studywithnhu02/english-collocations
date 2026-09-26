
export const GRAMMAR_KEY='english-collocations-preview-grammar-v2';
export const GRAMMAR_SOURCE='Essential Grammar in Use — Elementary, 2nd edition (uploaded PDF)';
export const CHAPTERS=[
{id:'c1',title:'Be, present, past & perfect',range:'Units 1–24',start:1,end:24,summary:'Be, các thì hiện tại/quá khứ, present perfect, passive và động từ.'},
{id:'c2',title:'Future, modals & existence',range:'Units 25–37',start:25,end:37,summary:'Thói quen quá khứ, kế hoạch, dự đoán, modal verbs và there/it.'},
{id:'c3',title:'Short answers, negatives, questions & reported speech',range:'Units 38–49',start:38,end:49,summary:'Dạng rút gọn, short answers, phủ định, câu hỏi và tường thuật.'},
{id:'c4',title:'Verb patterns & common verbs',range:'Units 50–57',start:50,end:57,summary:'V, V-ing, to-V, mục đích và các động từ/cụm động từ thông dụng.'},
{id:'c5',title:'Pronouns & possession',range:'Units 58–64',start:58,end:64,summary:'Đại từ, sở hữu, phản thân, sở hữu cách và a/an.'},
{id:'c6',title:'Nouns, articles & quantity',range:'Units 65–83',start:65,end:83,summary:'Danh từ, countable/uncountable, a/an/the, quantity và demonstratives.'},
{id:'c7',title:'Adjectives, adverbs & comparison',range:'Units 84–91',start:84,end:91,summary:'Tính từ, trạng từ, so sánh, enough và too.'},
{id:'c8',title:'Word order & time expressions',range:'Units 92–98',start:92,end:98,summary:'Trật tự từ và các giới từ/cụm chỉ thời gian.'},
{id:'c9',title:'Prepositions & phrasal verbs',range:'Units 99–108',start:99,end:108,summary:'Giới từ nơi chốn, quan hệ và phrasal verbs.'},
{id:'c10',title:'Connectors, conditionals & relative clauses',range:'Units 109–114',start:109,end:114,summary:'Liên từ, when/if và relative clauses.'}
];
const TITLE_LINES=`
1|am/is/are
2|am/is/are (questions)
3|I am doing (present continuous)
4|are you doing? (present continuous questions)
5|I do/work/like etc. (present simple)
6|I don’t ... (present simple negative)
7|Do you ...? (present simple questions)
8|I am doing and I do (present continuous and present simple)
9|I have ... / I’ve got ...
10|was/were
11|worked/got/went etc. (past simple)
12|I didn’t ... Did you ...? (past simple negative and questions)
13|I was doing (past continuous)
14|I was doing (past continuous) and I did (past simple)
15|I have done (present perfect 1)
16|I’ve just ... I’ve already ... I haven’t ... yet (present perfect 2)
17|Have you ever ...? (present perfect 3)
18|How long have you ...? (present perfect 4)
19|for since ago
20|I have done (present perfect) and I did (past simple)
21|is done was done (passive 1)
22|is being done has been done (passive 2)
23|be/have/do in present and past tenses
24|Regular and irregular verbs
25|I used to ...
26|What are you doing tomorrow?
27|I’m going to ...
28|will/shall (1)
29|will/shall (2)
30|might
31|can and could
32|must mustn’t needn’t
33|should
34|I have to ...
35|Would you like ...? I’d like ...
36|there is there are
37|there was/were there has/have been there will be
38|It ...
39|I am I don’t etc.
40|Have you? Are you? Don’t you? etc.
41|too/either so am I / neither do I etc.
42|isn’t haven’t don’t etc. (negatives)
43|is it ...? have you ...? do they ...? etc. (questions 1)
44|Who saw you? Who did you see? (questions 2)
45|Who is she talking to? What is it like? (questions 3)
46|What ...? Which ...? How ...?
47|How long does it take ...?
48|Do you know where ...? I don’t know what ... etc.
49|She said that ... He told me that ...
50|work/working go/going do/doing
51|to ... (I want to do) and -ing (I enjoy doing)
52|I want you to ... I told you to ...
53|I went to the shop to ...
54|go to ... go on ... go for ... go -ing
55|get
56|do and make
57|have
58|I/me he/him they/them etc.
59|my/his/their etc.
60|Whose is this? It’s mine/yours/hers etc.
61|I/me/my/mine
62|myself/yourself/themselves etc.
63|-’s (Ann’s camera / my brother’s car) etc.
64|a/an ...
65|flower(s) bus(es) (singular and plural)
66|a car / some money (countable/uncountable 1)
67|a car / some money (countable/uncountable 2)
68|a/an and the
69|the ...
70|go to work / go home / go to the cinema
71|I like music I hate exams
72|the ... (names of places)
73|this/that/these/those
74|one/ones
75|some and any
76|not + any no none
77|not + anybody/anyone/anything nobody/no-one/nothing
78|somebody/something/anything/nowhere etc.
79|every and all
80|all most some any no/none
81|both either neither
82|a lot much many
83|(a) little (a) few
84|old/nice/interesting etc. (adjectives)
85|quickly/badly/suddenly etc. (adverbs)
86|old/older expensive/more expensive
87|older than ... more expensive than ...
88|not as ... as
89|the oldest the most expensive
90|enough
91|too
92|He speaks English very well. (word order 1)
93|always/usually/often etc. (word order 2)
94|still yet already
95|Give me that book! Give it to me!
96|at 8 o’clock on Monday in April
97|from ... to ... until since for
98|before after during while
99|in at on (places 1)
100|in at on (places 2)
101|to in at (places 3)
102|under behind opposite etc. (prepositions)
103|up over through etc. (prepositions)
104|on at by with about (prepositions)
105|afraid of ... good at ... etc. preposition + -ing (good at -ing etc.)
106|listen to ... look at ... etc. (verb + preposition)
107|go in fall off run away etc. (phrasal verbs 1)
108|put on your shoes put your shoes on (phrasal verbs 2)
109|and but or so because
110|When ...
111|If we go ... If you see ... etc.
112|If I had ... If we went ... etc.
113|a person who ... a thing that/which ... (relative clauses 1)
114|the people we met the hotel you stayed at (relative clauses 2)
`.trim().split('\n').map(line=>{const i=line.indexOf('|');return{unit:Number(line.slice(0,i)),title:line.slice(i+1)}});

const GUIDE_LINES=`
1|am/is/are + adjective/noun/place|I am · he/she/it is · you/we/they are|I am ready for the meeting.
2|Am/Is/Are + subject ...?|Đảo be lên trước chủ ngữ|Are you ready?
3|am/is/are + V-ing|be + V-ing = đang diễn ra|I am working on a new flow.
4|Am/Is/Are + S + V-ing?|Câu hỏi tiếp diễn vẫn giữ be|Are you working today?
5|S + V(s)|He/She/It thêm -s/-es|She works with product teams.
6|S + do/does not + V|Sau do/does dùng V nguyên mẫu|I don’t work on Sundays.
7|Do/Does + S + V?|Does đi với he/she/it|Do you work remotely?
8|present continuous ↔ present simple|đang diễn ra ↔ thói quen/sự thật|I am working now, but I work from home every Friday.
9|have/has + noun · have got|have = có/sở hữu|I’ve got a new task.
10|was/were + ...|I/he/she/it was · you/we/they were|We were busy yesterday.
11|past simple: V2/ed|việc đã xong trong quá khứ|We launched the feature last week.
12|did/didn’t + V|Sau did/didn’t dùng V nguyên mẫu|Did you join the meeting?
13|was/were + V-ing|đang diễn ra tại một thời điểm quá khứ|I was reviewing the report at 8.
14|was/were + V-ing vs V2|nền đang diễn ra ↔ sự kiện xen vào|I was working when he called.
15|have/has + V3|quá khứ có liên hệ hiện tại|I have finished the prototype.
16|have/has + just/already/V3 · yet|just = vừa · already = đã · yet = chưa/đã chưa|I’ve already sent the email.
17|Have/Has + S + ever + V3?|ever hỏi kinh nghiệm|Have you ever used Figma?
18|How long + have/has + S + V3?|hỏi thời lượng kéo dài đến hiện tại|How long have you worked here?
19|for + duration · since + start · ago + past point|for = khoảng thời gian · since = điểm bắt đầu · ago = cách đây|We have worked together for two years.
20|present perfect ↔ past simple|không mốc cụ thể ↔ mốc quá khứ đã xong|I have finished it. I finished it yesterday.
21|be + V3|bị động cơ bản|The report was approved.
22|be + being + V3 · have/has been + V3|đang được làm ↔ đã được làm|The issue is being fixed.
23|be / have / do theo tense|nhận diện trợ động từ trước khi hỏi/phủ định|Do you have time?
24|regular vs irregular verbs|regular → -ed; irregular → học dạng riêng|work/worked · go/went
25|used to + V|thói quen/trạng thái trước đây|I used to work in an agency.
26|be + V-ing|kế hoạch đã sắp xếp|What are you doing tomorrow?
27|be going to + V|ý định/dự định hoặc dự đoán có dấu hiệu|We’re going to test it tomorrow.
28|will + V|quyết định, dự đoán, lời hứa|I’ll send it tonight.
29|will/shall|shall hay gặp trong đề nghị/ý định với I/we|Shall we start?
30|might + V|khả năng chưa chắc chắn|It might rain later.
31|can/could + V|khả năng, xin phép, đề nghị/lịch sự|Could you review this?
32|must/mustn’t/needn’t + V|bắt buộc / cấm / không cần|You must follow the policy.
33|should + V|lời khuyên / điều hợp lý|You should back up the data.
34|have to + V|nghĩa vụ do hoàn cảnh/quy định|I have to finish this today.
35|Would you like + noun/to-V? · I’d like + noun/to-V|mời / đề nghị lịch sự|Would you like to join the call?
36|there is/are + noun|there is một · there are nhiều|There is a problem.
37|there + be theo tense|was/were · has/have been · will be|There will be a meeting tomorrow.
38|It + be / V...|it có thể làm chủ ngữ hình thức|It is important to test early.
39|contracted forms|I’m, I don’t... giúp nói tự nhiên|I’m ready. I don’t know.
40|short answer = auxiliary|lặp trợ động từ/be, không lặp cả câu|Yes, I do. No, I’m not.
41|too/either · so/neither + auxiliary|too = cũng khẳng định; either = cũng phủ định|So am I. Neither do I.
42|be/auxiliary + not|not đứng sau be/trợ động từ|She isn’t ready. We haven’t finished.
43|be/have/do + S ...?|chọn trợ động từ theo câu|Do they work here?
44|Who + V? / Who did + S + V?|who là subject → không do; object → do|Who called you? Who did you call?
45|Who ... to? · What is it like?|hỏi người + giới từ; hỏi đặc điểm|What is the new app like?
46|what / which / how|what mở; which chọn; how hỏi cách/mức độ|Which option do you prefer?
47|How long does it take + to-V?|take + time|How long does it take to finish?
48|Do you know + wh-clause?|mệnh đề bên trong giữ word order câu kể|Do you know where she works?
49|said + clause · told + object + clause|say thường không object; tell thường có object|She said she was busy.
50|V / V-ing theo cấu trúc|học verb pattern thay vì dịch từng từ|I work here. I’m working now.
51|to-V vs V-ing|want/need + to-V; enjoy/avoid + V-ing|I want to learn. I enjoy learning.
52|want/tell + object + to-V|có object trước to-V|I told him to wait.
53|to-V = purpose|to-V nêu mục đích|I went to the shop to buy a notebook.
54|go to / go on / go for / go -ing|học cả cụm cố định|go shopping · go for a walk
55|get + context|get có nhiều nghĩa → học theo cụm|get ready · get home
56|do vs make|do = task/activity; make = create/result|do homework · make a plan
57|have + noun/collocation|have dùng trong nhiều cụm cố định|have lunch · have a meeting
58|I/me · he/him · they/them|subject ↔ object|She called me.
59|my/his/her/our/their + noun|tính từ sở hữu đứng trước noun|My laptop is new.
60|Whose ...? · mine/yours/hers...|đại từ sở hữu đứng độc lập|Whose bag is this? It’s mine.
61|I/me/my/mine|subject/object/possessive adjective/pronoun|They called me about my work.
62|myself/yourself/themselves|subject = object hoặc nhấn mạnh|I did it myself.
63|noun + ’s|sở hữu/quan hệ|my brother’s car
64|a/an + singular countable noun|a/an theo âm đầu; không với plural/uncountable|an idea · a project
65|singular ↔ plural|-s/-es và dạng bất quy tắc|one bus · two buses
66|countable vs uncountable|countable có số nhiều; uncountable không đi trực tiếp với a/an|a task · some information
67|many/much/some/any + noun|chọn theo countability|many tasks · much time
68|a/an ↔ the|chưa xác định ↔ đã xác định|I saw a designer. The designer smiled.
69|the + specific/known noun|the khi người nghe có thể xác định|Close the door.
70|go to work/home vs the cinema|một số nơi dùng zero article theo mục đích|I’m going home.
71|general nouns without the|danh từ nói chung theo ngữ cảnh|I like music.
72|the + some place names|tên địa danh có quy tắc riêng|the Netherlands · the United States
73|this/that/these/those|near/far + singular/plural|These notes are useful.
74|one/ones|thay noun để tránh lặp|the red one
75|some / any|some thường khẳng định/offer; any thường hỏi/phủ định|Do you have any questions?
76|not ... any / no / none|ba cách phủ định số lượng|I don’t have any time. No problem. None left.
77|not + anybody... / nobody...|không dùng double negative|I didn’t see anybody. Nobody called.
78|somebody/something/anything/nowhere...|some/any/no/every + body/thing/where|something useful
79|every + singular · all + plural/uncountable|every = từng; all = toàn bộ|Every student is ready.
80|all/most/some/any/no/none|chọn theo số lượng và kiểu noun|Most people agree.
81|both/either/neither|both = cả hai; either = một trong hai; neither = không cái nào|Both options work.
82|a lot of / much / many|a lot of rộng; many countable; much uncountable|many meetings · much time
83|a little/little · a few/few|a little/few = có một ít; little/few = gần như không|a few ideas
84|adjective + noun / be + adjective|tính từ mô tả noun hoặc đứng sau be/linking verb|a useful tool · The tool is useful.
85|verb + adverb|trạng từ mô tả hành động|She explained it clearly.
86|-er / more + adjective|tính từ ngắn ↔ dài|older · more useful
87|comparative + than|so sánh hai đối tượng|This flow is simpler than the old one.
88|not as + adjective + as|không bằng|This screen isn’t as clear as the first one.
89|the + -est / the most|so sánh nhất|the most useful feature
90|adjective + enough / enough + noun|đủ mức độ ↔ đủ số lượng|clear enough · enough time
91|too + adjective/adverb|quá mức cần thiết|too complicated
92|S + V + ... + adverb|trật tự verb/object/adverb|He speaks English very well.
93|frequency adverb position|always/usually/often trước main verb, sau be|She usually works late.
94|still / yet / already|still = vẫn; yet = chưa/đã chưa; already = đã|I’ve already sent it.
95|give + object + object / to-object|hai pattern tân ngữ|Give me the file.
96|at + time · on + day/date · in + month/year|at → giờ; on → ngày; in → tháng/năm|at 8 · on Monday · in April
97|from...to · until · since · for|khoảng / kết thúc / bắt đầu / duration|from Monday to Friday
98|before/after/during/while|chọn theo quan hệ thời gian|during the meeting · while I was working
99|in/at/on for places|in = không gian; at = điểm; on = bề mặt/vehicle tùy ngữ cảnh|in a room · at the station
100|in/at/on for places 2|tiếp tục phân biệt location theo cách nhìn|at work · in a city · on a bus
101|to / in / at|to = hướng đến; in/at = vị trí|go to work · arrive at the office
102|under/behind/opposite + noun|quan hệ vị trí|under the desk
103|up/over/through etc.|hướng và chuyển động|walk through the park
104|on/at/by/with/about|giới từ theo quan hệ/cụm cố định|by car · with a pen · about the project
105|adjective + preposition + noun/-ing|afraid of, good at... học theo cụm|good at explaining
106|verb + preposition|listen to, look at... học như cụm|listen to the user
107|phrasal verb + particle|nghĩa đổi khi thêm particle|fall off · run away
108|phrasal verb + object|một số phrasal verb cho phép tách/không tách tùy cấu trúc|put on your shoes / put your shoes on
109|and/but/or/so/because|cộng / đối lập / lựa chọn / kết quả / nguyên nhân|We tested it, so we kept it.
110|when + clause|nối sự việc theo thời điểm|Call me when you arrive.
111|if + present, will + V|điều kiện có khả năng xảy ra|If we test early, we will learn faster.
112|if + past, would + V|giả định/ít thực hơn ở hiện tại|If I had more time, I would research more.
113|noun + who/that/which + clause|who cho người; that/which cho vật theo cấu trúc|The user who reported it replied.
114|relative clause with omitted object|có thể bỏ relative pronoun khi là object trong defining clause|The people we met were helpful.
`.trim().split('\n').map(line=>{const p=line.split('|');return{unit:Number(p[0]),formula:p[1]||'',memory:p[2]||'',example:p[3]||''}});

const guide=Object.fromEntries(GUIDE_LINES.map(x=>[x.unit,x]));
export const GRAMMAR_TOPICS=TITLE_LINES.map(x=>{const c=CHAPTERS.find(c=>x.unit>=c.start&&x.unit<=c.end),g=guide[x.unit]||{};return{id:'u'+x.unit,unit:x.unit,title:x.title,chapterId:c.id,chapter:c.title,range:c.range,formula:g.formula||c.summary,memory:g.memory||c.summary,example:g.example||''}});
export const APPENDICES=[
{id:'a1',title:'Active and passive',summary:'Ôn nhanh chủ động ↔ bị động.'},
{id:'a2',title:'List of irregular verbs',summary:'Tra cứu các dạng động từ bất quy tắc.'},
{id:'a3',title:'Irregular verbs in groups',summary:'Học động từ bất quy tắc theo nhóm.'},
{id:'a4',title:'Short forms (he’s / I’d / don’t etc.)',summary:'Các dạng rút gọn thường gặp.'},
{id:'a5',title:'Spelling',summary:'Quy tắc chính tả cần nhớ.'},
{id:'a6',title:'Phrasal verbs (look out / take off etc.)',summary:'Tra cứu phrasal verbs cốt lõi.'},
{id:'a7',title:'Phrasal verbs + object (fill in a form / put out a fire etc.)',summary:'Phrasal verbs đi với tân ngữ.'}
];
export function loadGrammarProgress(){try{const v=JSON.parse(localStorage.getItem(GRAMMAR_KEY)||'{}');return v&&typeof v==='object'?v:{}}catch{return {}}}
export function saveGrammarProgress(value){localStorage.setItem(GRAMMAR_KEY,JSON.stringify(value||{}))}
export function toggleGrammarDone(progress,id){const next={...(progress||{})};next[id]={done:!next[id]?.done,updatedAt:new Date().toISOString()};saveGrammarProgress(next);return next}
export function getGrammarStats(progress){const done=GRAMMAR_TOPICS.filter(x=>progress?.[x.id]?.done).length,total=GRAMMAR_TOPICS.length;return{total,done,remaining:total-done,percent:Math.round(done/total*100)}}
