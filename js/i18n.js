/**
 * ============================================================================
 * Multi-Language Dictionary (Thai / Chinese / Burmese)
 * Final Assembly - Safety Survey
 * ============================================================================
 */

const I18N = {
  th: {
    app_title: 'Final Assembly - Safety Survey',
    app_subtitle: 'ระบบสำรวจและประเมินความปลอดภัยของพนักงานในสายการผลิต',
    nav_dashboard: 'แดชบอร์ดสรุปผล',
    nav_survey: 'ทำแบบสำรวจ',
    nav_questions: 'ตั้งค่าคำถาม (Question)',
    nav_records: 'รายการสำรวจ (Survey list)',
    nav_settings: 'เชื่อมต่อ Google Sheets',

    // Status & Sync
    status_connected: 'เชื่อมต่อ Google Sheets แล้ว',
    status_demo: 'โหมดพร้อมใช้งาน (ซิงค์ชีตอัตโนมัติ)',
    status_syncing: 'กำลังซิงค์ข้อมูล...',
    btn_refresh: 'ซิงค์ข้อมูลล่าสุด',
    btn_open_sheet: 'เปิด Google Sheets',

    // KPI Cards
    kpi_total_surveys: 'จำนวนที่สำรวจทั้งหมด',
    kpi_today_surveys: 'สำรวจวันนี้ (คน)',
    kpi_avg_score: 'คะแนนความปลอดภัยเฉลี่ย',
    kpi_pass_rate: 'อัตราผ่านเกณฑ์ (≥80%)',
    unit_people: 'คน',
    unit_points: 'คะแนน',

    // Filters
    filter_title: 'ตัวกรองข้อมูลแดชบอร์ด',
    filter_all_lines: 'ทุกไลน์การผลิต (All Lines)',
    filter_date_from: 'ตั้งแต่วันที่',
    filter_date_to: 'ถึงวันที่',
    filter_search_emp: 'ค้นหารหัส / ชื่อพนักงาน...',
    btn_reset_filter: 'ล้างตัวกรอง',

    // Charts
    chart_daily_title: '1. จำนวนพนักงานที่ถูก Survey ในแต่ละวัน (แบ่งตามแผนก)',
    chart_daily_sub: 'เปรียบเทียบจำนวนพนักงานที่ถูกสำรวจในแต่ละวัน แยกสีตามแผนก/ไลน์',
    chart_dept_title: '2. สรุปจำนวนพนักงานที่ทำการสำรวจ (แบ่งตามแผนก)',
    chart_dept_sub: 'ยอดรวมจำนวนพนักงานที่ได้รับการสำรวจสะสมในแต่ละแผนก/ไลน์',
    chart_bubble_title: '3. คะแนนเฉลี่ยของแต่ละแผนก (Bubble Chart)',
    chart_bubble_sub: 'แกน X = หมวดหมู่ | แกน Y = คะแนน (1-10) แยกสีตามแผนก',
    chart_emp_title: 'คะแนนของพนักงานแต่ละคน และแยกตามไลน์ (Individual Score & Line)',
    chart_emp_sub: 'ตารางแสดงผลคะแนนรายบุคคลและแยกตามแผนก/ไลน์ (คะแนนเต็ม 10)',
    chart_label_count: 'จำนวนพนักงาน (คน)',
    chart_label_avg_pct: 'คะแนนเฉลี่ย (1-10)',
    chart_label_emp_score: 'คะแนนพนักงาน',
    chart_type_bar: 'กราฟแท่ง',
    chart_type_line: 'กราฟเส้น',
    chart_type_bubble: 'Bubble',
    btn_fullscreen: 'ขยายเต็มหน้าจอ',
    cat_short_1: 'หมวดที่ 1',
    cat_short_2: 'หมวดที่ 2',
    cat_short_3: 'หมวดที่ 3',
    cat_short_total: 'คะแนนรวม',

    // Survey Form
    form_title: 'บันทึกการสำรวจความปลอดภัย (Safety Survey)',
    form_subtitle: 'ประเมินความปลอดภัยของพนักงานหน้างานและบันทึกลงชีต "Survey list"',
    field_date: 'วันที่สำรวจ',
    field_line: 'ไลน์การผลิต (Production Line)',
    field_line_placeholder: 'เลือกหรือระบุไลน์การผลิต',
    field_emp_id: 'รหัสพนักงาน (Employee ID)',
    field_emp_id_placeholder: 'เช่น FA-1024',
    field_emp_name: 'ชื่อ-นามสกุล พนักงาน',
    field_emp_name_placeholder: 'ระบุชื่อพนักงานที่รับการตรวจ',
    field_auditor: 'ผู้ตรวจประเมิน (Auditor / Leader)',
    field_auditor_placeholder: 'ชื่อหัวหน้างาน / จป.',
    field_note: 'ข้อเสนอแนะ / สิ่งที่พบเห็นเพิ่มเติม',
    field_note_placeholder: 'ระบุจุดที่ต้องแก้ไข หรือชมเชย (ถ้ามี)...',
    questions_section_title: 'หัวข้อคำถามความปลอดภัย (จากชีต Question)',
    score_guide: '1 = ต้องปรับปรุงเร่งด่วน | 3 = ปานกลาง | 5 = ดีเยี่ยมปลอดภัย 100%',
    live_score_label: 'คะแนนรวมที่ได้',
    btn_submit_survey: 'บันทึกผลสำรวจลง Google Sheets',
    btn_clear_form: 'ล้างฟอร์ม',

    // Questions Manager ("Question" sheet)
    q_mgr_title: 'จัดการคำถามความปลอดภัย (ชีต "Question")',
    q_mgr_subtitle: 'เพิ่ม แก้ไข หรือลบคำถามที่จะใช้สอบถามพนักงาน รองรับ 3 ภาษา (ไทย / จีน / พม่า)',
    btn_add_question: 'เพิ่มคำถามใหม่',
    btn_save_question: 'บันทึกคำถาม',
    btn_cancel: 'ยกเลิก',
    btn_edit: 'แก้ไข',
    btn_delete: 'ลบ',
    btn_auto_translate: 'แปลภาษาจีน/พม่า อัตโนมัติ',
    q_col_id: 'รหัสข้อ',
    q_col_category: 'หมวดหมู่',
    q_col_th: 'คำถาม (ภาษาไทย)',
    q_col_zh: 'คำถาม (ภาษาจีน - 中文)',
    q_col_my: 'คำถาม (ภาษาพม่า - မြန်မာ)',
    q_col_max: 'คะแนนเต็ม',
    q_col_status: 'สถานะ',
    q_status_active: 'ใช้งาน',
    q_status_inactive: 'ปิดใช้งาน',

    // Survey List Table ("Survey list" sheet)
    table_title: 'ตารางข้อมูลผลสำรวจรายบุคคล (ชีต "Survey list")',
    table_subtitle: 'แสดงรายการสำรวจทั้งหมดพร้อมคะแนนของแต่ละคนในแต่ละไลน์',
    col_date: 'วันที่',
    col_line: 'ไลน์ผลิต',
    col_emp_id: 'รหัสพนักงาน',
    col_emp_name: 'ชื่อพนักงาน',
    col_auditor: 'ผู้ตรวจ',
    col_score: 'คะแนนที่ได้',
    col_pct: 'คิดเป็น %',
    col_note: 'หมายเหตุ',
    col_action: 'รายละเอียด',
    btn_export_csv: 'ส่งออก Excel (CSV)',
    btn_view_detail: 'ดูคะแนนรายข้อ',

    // Settings Modal
    settings_title: 'ตั้งค่าการเชื่อมต่อ Google Sheets & Apps Script',
    settings_sheet_label: 'ลิงก์ Google Sheets ของโปรเจกต์นี้:',
    settings_url_label: 'Apps Script Web App URL (สำหรับบันทึกข้อมูลลงชีตโดยตรง):',
    settings_url_help: 'นำโค้ดจากไฟล์ google-apps-script/Code.gs ไปวางใน Extensions > Apps Script ของ Google Sheets แล้วกด Deploy > New deployment (Web app) จากนั้นนำ URL มาวางที่นี่',
    btn_save_settings: 'บันทึกการตั้งค่า',
    btn_test_conn: 'ทดสอบดึงข้อมูล',
    btn_copy_gas: 'คัดลอกโค้ด Apps Script (Code.gs)',

    // Notifications
    btn_capture: 'Capture Dashboard',
    msg_capturing: 'กำลังประมวลผลภาพหน้าจอ Dashboard...',
    msg_capture_done: 'บันทึกภาพหน้าจอ Dashboard เรียบร้อยแล้ว!',
    msg_capture_error: 'เกิดข้อผิดพลาดในการบันทึกภาพหน้าจอ',
    msg_survey_saved: 'บันทึกข้อมูลการสำรวจลงระบบเรียบร้อยแล้ว!',
    msg_question_saved: 'บันทึกคำถามลงในชีต Question เรียบร้อยแล้ว!',
    msg_question_deleted: 'ลบคำถามเรียบร้อยแล้ว',
    msg_please_fill_emp: 'กรุณากรอกรหัสพนักงาน ชื่อพนักงาน และให้คะแนนครบทุกข้อ',
    msg_copied_gas: 'คัดลอกโค้ด Apps Script เรียบร้อย! นำไปวางใน Google Sheets > Extensions > Apps Script ได้เลย'
  },

  zh: {
    app_title: '总装车间 - 员工安全巡检系统',
    app_subtitle: 'Final Assembly 生产线员工安全评估与实时看板',
    nav_dashboard: '安全数据看板',
    nav_survey: '填写安全巡检',
    nav_questions: '题库管理 (Question)',
    nav_records: '巡检记录 (Survey list)',
    nav_settings: '连接 Google 表格',

    // Status & Sync
    status_connected: '已连接 Google Sheets',
    status_demo: '就绪模式 (自动同步表格)',
    status_syncing: '正在同步数据...',
    btn_refresh: '刷新同步数据',
    btn_open_sheet: '打开 Google 表格',

    // KPI Cards
    kpi_total_surveys: '累计巡检总人数',
    kpi_today_surveys: '今日已巡检 (人)',
    kpi_avg_score: '平均安全得分率',
    kpi_pass_rate: '安全达标率 (≥80%)',
    unit_people: '人',
    unit_points: '分',

    // Filters
    filter_title: '看板数据筛选',
    filter_all_lines: '所有生产线 (All Lines)',
    filter_date_from: '开始日期',
    filter_date_to: '结束日期',
    filter_search_emp: '搜索工号 / 员工姓名...',
    btn_reset_filter: '重置筛选',

    // Charts
    chart_daily_title: '1. 每日被巡检员工人数 (按部门/产线划分)',
    chart_daily_sub: '每日各部门/生产线安全抽检员工人数对比',
    chart_dept_title: '2. 已巡检员工总人数汇总 (按部门/产线划分)',
    chart_dept_sub: '各部门/生产线累计已完成安全巡检的员工人数',
    chart_bubble_title: '3. 各部门分类平均得分 (Bubble 气泡图)',
    chart_bubble_sub: 'X轴 = 检查类别 | Y轴 = 得分 (1-10分，按部门颜色区分)',
    chart_emp_title: '员工个人及各产线安全得分明细 (Individual Score & Line)',
    chart_emp_sub: '每位受检员工在各产线的详细得分记录 (满分 10 分)',
    chart_label_count: '受检人数 (人)',
    chart_label_avg_pct: '平均得分 (1-10)',
    chart_label_emp_score: '员工得分',
    chart_type_bar: '柱状图',
    chart_type_line: '折线图',
    chart_type_bubble: '气泡图',
    btn_fullscreen: '全屏显示',
    cat_short_1: '第一部分',
    cat_short_2: '第二部分',
    cat_short_3: '第三部分',
    cat_short_total: '总平均分',

    // Survey Form
    form_title: '员工安全巡检评分表 (Safety Survey)',
    form_subtitle: '现场评估员工安全操作并保存至 "Survey list" 工作表',
    field_date: '巡检日期',
    field_line: '所属生产线 (Production Line)',
    field_line_placeholder: '选择或输入生产线',
    field_emp_id: '员工工号 (Employee ID)',
    field_emp_id_placeholder: '例如: FA-1024',
    field_emp_name: '员工姓名 (Employee Name)',
    field_emp_name_placeholder: '输入受检员工姓名',
    field_auditor: '巡检员 / 班组长 (Auditor)',
    field_auditor_placeholder: '输入检查人姓名',
    field_note: '备注 / 整改建议',
    field_note_placeholder: '填写发现的隐患或表扬事项（选填）...',
    questions_section_title: '安全检查项目 (来自 Question 工作表)',
    score_guide: '1 = 急需整改 | 3 = 一般合格 | 5 = 优秀 (100%符合安全规范)',
    live_score_label: '当前总得分',
    btn_submit_survey: '提交保存至 Google Sheets',
    btn_clear_form: '清空表单',

    // Questions Manager ("Question" sheet)
    q_mgr_title: '安全检查题库管理 ("Question" 工作表)',
    q_mgr_subtitle: '添加、编辑或删除安全巡检问题，支持泰语 / 中文 / 缅甸语三语切换',
    btn_add_question: '新增检查问题',
    btn_save_question: '保存问题',
    btn_cancel: '取消',
    btn_edit: '编辑',
    btn_delete: '删除',
    btn_auto_translate: '自动生成中文/缅语翻译',
    q_col_id: '题号',
    q_col_category: '分类',
    q_col_th: '问题内容 (泰语 - ไทย)',
    q_col_zh: '问题内容 (中文)',
    q_col_my: '问题内容 (缅甸语 - မြန်မာ)',
    q_col_max: '满分分值',
    q_col_status: '状态',
    q_status_active: '启用',
    q_status_inactive: '停用',

    // Survey List Table ("Survey list" sheet)
    table_title: '员工安全巡检记录明细表 ("Survey list" 工作表)',
    table_subtitle: '显示所有受检员工在各生产线的详细得分记录',
    col_date: '日期',
    col_line: '生产线',
    col_emp_id: '工号',
    col_emp_name: '员工姓名',
    col_auditor: '巡检员',
    col_score: '总得分',
    col_pct: '得分率 %',
    col_note: '备注',
    col_action: '详情',
    btn_export_csv: '导出 Excel (CSV)',
    btn_view_detail: '查看各题得分',

    // Settings Modal
    settings_title: 'Google Sheets 与 Apps Script 连接设置',
    settings_sheet_label: '当前绑定的 Google Sheets 链接:',
    settings_url_label: 'Apps Script Web App URL (用于实时写入数据):',
    settings_url_help: '将 google-apps-script/Code.gs 中的代码复制到 Google 表格的 Extensions > Apps Script 中，点击 Deploy > New deployment (Web app)，然后将生成的 URL 粘贴到此处。',
    btn_save_settings: '保存设置',
    btn_test_conn: '测试数据连接',
    btn_copy_gas: '复制 Apps Script 代码 (Code.gs)',

    // Notifications
    btn_capture: '截图保存看板',
    msg_capturing: '正在生成看板高清截图...',
    msg_capture_done: '看板截图已成功下载！',
    msg_capture_error: '生成截图时出错',
    msg_survey_saved: '安全巡检记录已成功保存！',
    msg_question_saved: '问题已成功保存至 Question 工作表！',
    msg_question_deleted: '问题已删除',
    msg_please_fill_emp: '请填写员工工号、姓名并完成所有问题的评分',
    msg_copied_gas: '已复制 Apps Script 代码！请粘贴到 Google Sheets > Extensions > Apps Script'
  },

  my: {
    app_title: 'Final Assembly - လုပ်ငန်းခွင် အန္တရာယ်ကင်းရှင်းရေး စစ်ဆေးမှုစနစ်',
    app_subtitle: 'ထုတ်လုပ်မှုလိုင်းရှိ ဝန်ထမ်းများ၏ လုံခြုံရေးအကဲဖြတ်ခြင်းနှင့် ဒက်ရှ်ဘုတ်စနစ်',
    nav_dashboard: 'ဒက်ရှ်ဘုတ် အနှစ်ချုပ်',
    nav_survey: 'စစ်ဆေးချက် ဖြည့်သွင်းရန်',
    nav_questions: 'မေးခွန်းများ စီမံရန် (Question)',
    nav_records: 'စစ်ဆေးမှုမှတ်တမ်း (Survey list)',
    nav_settings: 'Google Sheets ချိတ်ဆက်မှု',

    // Status & Sync
    status_connected: 'Google Sheets ချိတ်ဆက်ပြီးပါပြီ',
    status_demo: 'အသင့်သုံးမုဒ် (ชีตနှင့် အလိုအလျောက်ချိတ်ဆက်)',
    status_syncing: 'ဒေတာ ရယူနေပါသည်...',
    btn_refresh: 'ဒေတာ အသစ်ရယူရန်',
    btn_open_sheet: 'Google Sheets ဖွင့်ရန်',

    // KPI Cards
    kpi_total_surveys: 'စစ်ဆေးပြီးသူ စုစုပေါင်း',
    kpi_today_surveys: 'ယနေ့ စစ်ဆေးပြီးသူ (ဦး)',
    kpi_avg_score: 'ပျမ်းမျှ လုံခြုံရေးရမှတ်',
    kpi_pass_rate: 'အောင်မြင်မှုနှုန်း (≥80%)',
    unit_people: 'ဦး',
    unit_points: 'မှတ်',

    // Filters
    filter_title: 'ဒက်ရှ်ဘုတ် ဒေတာစစ်ထုတ်ရန်',
    filter_all_lines: 'ထုတ်လုပ်မှုလိုင်း အားလုံး (All Lines)',
    filter_date_from: 'စတင်သည့်ရက်စွဲ',
    filter_date_to: 'ပြီးဆုံးသည့်ရက်စွဲ',
    filter_search_emp: 'ဝန်ထမ်းအမှတ် / အမည် ရှာဖွေရန်...',
    btn_reset_filter: 'ပြန်လည်သတ်မှတ်ရန်',

    // Charts
    chart_daily_title: '1. နေ့စဉ် စစ်ဆေးခဲ့သည့် ဝန်ထမ်းဦးရေ (ဌာန/လိုင်းအလိုက်)',
    chart_daily_sub: 'နေ့စဉ် ဌာနနှင့် လိုင်းအလိုက် စစ်ဆေးခဲ့သော ဝန်ထမ်းအရေအတွက်',
    chart_dept_title: '2. စစ်ဆေးပြီးသော ဝန်ထမ်းစုစုပေါင်း (ဌာန/လိုင်းအလိုက်)',
    chart_dept_sub: 'ဌာနနှင့် ထုတ်လုပ်မှုလိုင်း တစ်ခုချင်းစီ၏ စစ်ဆေးပြီးသူ စုစုပေါင်း',
    chart_bubble_title: '3. ဌာနအလိုက် ပျမ်းမျှရမှတ် (Bubble Chart)',
    chart_bubble_sub: 'X ဝင်ရိုး = ကဏ္ဍ | Y ဝင်ရိုး = ရမှတ် (1-10) ဌာနအလိုက် အရောင်ခွဲခြားထားသည်',
    chart_emp_title: 'ဝန်ထမ်းတစ်ဦးချင်းနှင့် လိုင်းအလိုက် ရမှတ်များ (Individual Score & Line)',
    chart_emp_sub: 'ဝန်ထမ်းတစ်ဦးချင်းစီနှင့် လိုင်းအလိုက် ရမှတ်မှတ်တမ်း (အမြင့်ဆုံး ၁၀ မှတ်)',
    chart_label_count: 'ဝန်ထမ်းဦးရေ (ဦး)',
    chart_label_avg_pct: 'ပျမ်းမျှရမှတ် (1-10)',
    chart_label_emp_score: 'ဝန်ထမ်းရမှတ်',
    chart_type_bar: 'ဘားဂရပ်',
    chart_type_line: 'မျဉ်းဂရပ်',
    chart_type_bubble: 'Bubble',
    btn_fullscreen: 'မျက်နှာပြင်အပြည့်',
    cat_short_1: 'အပိုင်း ၁',
    cat_short_2: 'အပိုင်း ၂',
    cat_short_3: 'အပိုင်း ၃',
    cat_short_total: 'စုစုပေါင်း',

    // Survey Form
    form_title: 'လုံခြုံရေး စစ်ဆေးအမှတ်ပေးဖောင် (Safety Survey)',
    form_subtitle: 'ဝန်ထမ်း၏ လုပ်ငန်းခွင်လုံခြုံရေးကို အမှတ်ပေးပြီး "Survey list" သို့ သိမ်းဆည်းရန်',
    field_date: 'စစ်ဆေးသည့်ရက်စွဲ',
    field_line: 'ထုတ်လုပ်မှုလိုင်း (Production Line)',
    field_line_placeholder: 'လိုင်းရွေးချယ်ပါ',
    field_emp_id: 'ဝန်ထမ်းအမှတ် (Employee ID)',
    field_emp_id_placeholder: 'ဥပမာ - FA-1024',
    field_emp_name: 'ဝန်ထမ်းအမည် (Employee Name)',
    field_emp_name_placeholder: 'ဝန်ထမ်းအမည် ထည့်သွင်းပါ',
    field_auditor: 'စစ်ဆေးသူအမည် (Auditor)',
    field_auditor_placeholder: 'ကြီးကြပ်ရေးမှူး / စစ်ဆေးသူအမည်',
    field_note: 'မှတ်ချက် / အကြံပြုချက်',
    field_note_placeholder: 'ပြုပြင်ရန်လိုအပ်ချက် သို့မဟုတ် မှတ်ချက်ရေးပါ...',
    questions_section_title: 'လုံခြုံရေး မေးခွန်းများ (Question ชีตမှ)',
    score_guide: '1 = အမြန်ပြုပြင်ရန် | 3 = သင့်တင့် | 5 = အလွန်ကောင်းမွန် (100% လုံခြုံမှုရှိ)',
    live_score_label: 'စုစုပေါင်း ရမှတ်',
    btn_submit_survey: 'Google Sheets သို့ သိမ်းဆည်းမည်',
    btn_clear_form: 'ဖောင်ရှင်းလင်းရန်',

    // Questions Manager ("Question" sheet)
    q_mgr_title: 'မေးခွန်းများ စီမံခန့်ခွဲခြင်း ("Question" الشيت)',
    q_mgr_subtitle: 'ဝန်ထမ်းများကို မေးမြန်းမည့် မေးခွန်းများကို အသစ်ထည့်ခြင်း၊ ပြင်ဆင်ခြင်း ပြုလုပ်နိုင်သည် (ထိုင်း / တရုတ် / မြန်မာ ၃ ဘာသာ)',
    btn_add_question: 'မေးခွန်းအသစ်ထည့်ရန်',
    btn_save_question: 'မေးခွန်းသိမ်းဆည်းရန်',
    btn_cancel: 'ပယ်ဖျက်ရန်',
    btn_edit: 'ပြင်ဆင်ရန်',
    btn_delete: 'ဖျက်ရန်',
    btn_auto_translate: 'တရုတ်/မြန်မာ ဘာသာပြန်ပေးရန်',
    q_col_id: 'အမှတ်စဉ်',
    q_col_category: 'အမျိုးအစား',
    q_col_th: 'မေးခွန်း (ထိုင်းဘာသာ)',
    q_col_zh: 'မေးခွန်း (တရုတ်ဘာသာ - 中文)',
    q_col_my: 'မေးခွန်း (မြန်မာဘာသာ)',
    q_col_max: 'အမြင့်ဆုံးမှတ်',
    q_col_status: 'အခြေအနေ',
    q_status_active: 'အသုံးပြုနေသည်',
    q_status_inactive: 'ပိတ်ထားသည်',

    // Survey List Table ("Survey list" sheet)
    table_title: 'ဝန်ထမ်းတစ်ဦးချင်း စစ်ဆေးမှုမှတ်တမ်း ("Survey list" ชีต)',
    table_subtitle: 'လိုင်းအလိုက်နှင့် ဝန်ထမ်းတစ်ဦးချင်းစီ၏ ရမှတ်မှတ်တမ်းများ အားလုံး',
    col_date: 'ရက်စွဲ',
    col_line: 'ထုတ်လုပ်မှုလိုင်း',
    col_emp_id: 'ဝန်ထမ်းအမှတ်',
    col_emp_name: 'ဝန်ထမ်းအမည်',
    col_auditor: 'စစ်ဆေးသူ',
    col_score: 'ရမှတ်',
    col_pct: 'ရာခိုင်နှုန်း %',
    col_note: 'မှတ်ချက်',
    col_action: 'အသေးစိတ်',
    btn_export_csv: 'Excel (CSV) ထုတ်ယူရန်',
    btn_view_detail: 'အသေးစိတ်ကြည့်ရန်',

    // Settings Modal
    settings_title: 'Google Sheets နှင့် Apps Script ချိတ်ဆက်မှု ပြင်ဆင်ရန်',
    settings_sheet_label: 'Google Sheets လင့်ခ်:',
    settings_url_label: 'Apps Script Web App URL (ဒေတာသိမ်းဆည်းရန်):',
    settings_url_help: 'google-apps-script/Code.gs မှ ကုဒ်ကို Google Sheets > Extensions > Apps Script တွင်ထည့်ပြီး Deploy > New deployment (Web app) လုပ်ကာ ရရှိလာသော URL ကို ဤနေရာတွင် ထည့်ပါ။',
    btn_save_settings: 'သိမ်းဆည်းရန်',
    btn_test_conn: 'ချိတ်ဆက်မှု စမ်းသပ်ရန်',
    btn_copy_gas: 'Apps Script ကုဒ် ကူးယူရန် (Code.gs)',

    // Notifications
    btn_capture: 'Capture ဓာတ်ပုံရိုက်ရန်',
    msg_capturing: 'Dashboard ပုံရိပ်ကို ဖမ်းယူနေပါသည်...',
    msg_capture_done: 'Dashboard ပုံကို သိမ်းဆည်းပြီးပါပြီ!',
    msg_capture_error: 'ပုံဖမ်းယူရာတွင် အမှားအယွင်းရှိပါသည်',
    msg_survey_saved: 'စစ်ဆေးမှုမှတ်တမ်းကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!',
    msg_question_saved: 'မေးခွန်းကို Question ชีตသို့ သိမ်းဆည်းပြီးပါပြီ!',
    msg_question_deleted: 'မေးခွန်းကို ဖျက်ပြီးပါပြီ',
    msg_please_fill_emp: 'ကျေးဇူးပြု၍ ဝန်ထမ်းအမှတ်၊ အမည်နှင့် မေးခွန်းအားလုံးကို အမှတ်ပေးပါ',
    msg_copied_gas: 'Apps Script ကုဒ်ကို ကူးယူပြီးပါပြီ!'
  }
};

/**
 * คำถามเริ่มต้นสำหรับชีต "Question" (รองรับ 3 ภาษา: ไทย, จีน, พม่า)
 */
const DEFAULT_QUESTIONS = [
  {
    id: 'Q1',
    category: 'หมวดที่ 1: ตรวจสอบการจัดประชุม (Check & Verify)',
    category_zh: '第一部分：早会检查与确认 (Check & Verify)',
    category_my: 'အပိုင်း ၁ - အစည်းအဝေး စစ်ဆေးအတည်ပြုခြင်း (Check & Verify)',
    text_th: 'ก่อนเริ่มกะ หัวหน้าไลน์ได้เรียกประชุมบรีฟงานเรื่องความปลอดภัยไหม?',
    text_zh: '开班前，产线组长是否有召集早会强调安全事项？',
    text_my: 'အလုပ်ဆင်းချိန်မစမီ လိုင်းခေါင်းဆောင်မှ လုံခြုံရေးအကြောင်း အစည်းအဝေးခေါ်ယူပြောကြားပါသလား?',
    max_score: 1,
    active: true
  },
  {
    id: 'Q2',
    category: 'หมวดที่ 1: ตรวจสอบการจัดประชุม (Check & Verify)',
    category_zh: '第一部分：早会检查与确认 (Check & Verify)',
    category_my: 'အပိုင်း ၁ - အစည်းအဝေး စစ်ဆေးအတည်ပြုခြင်း (Check & Verify)',
    text_th: 'ตอนประชุม หัวหน้าใช้เวลาคุยเรื่องความปลอดภัยประมาณกี่นาที?',
    text_zh: '早会时，组长大约花多少分钟讲解安全问题？',
    text_my: 'အစည်းအဝေးတွင် ခေါင်းဆောင်မှ လုံခြုံရေးအကြောင်း မိနစ်မည်မျှကြာအောင် ပြောကြားပါသလဲ?',
    max_score: 1,
    active: true
  },
  {
    id: 'Q3',
    category: 'หมวดที่ 2: ตรวจสอบความเข้าใจและเนื้อหา (Content & Comprehension)',
    category_zh: '第二部分：内容理解与掌握 (Content & Comprehension)',
    category_my: 'အပိုင်း ၂ - အကြောင်းအရာ နားလည်သဘောပေါက်မှု (Content & Comprehension)',
    text_th: 'วันนี้หัวหน้าเน้นย้ำเรื่องความปลอดภัยเกี่ยวกับอะไรเป็นพิเศษ ลองเล่าให้ฟังซัก 1 เรื่องได้ไหม?',
    text_zh: '今天组长特别强调了哪方面的安全事项？能举出1个例子吗？',
    text_my: 'ယနေ့ ခေါင်းဆောင်မှ မည်သည့်လုံခြုံရေးအချက်ကို အထူးအလေးပေး ပြောကြားခဲ့ပါသလဲ? (၁ ချက်ခန့် ပြောပြပေးပါ)',
    max_score: 2,
    active: true
  },
  {
    id: 'Q4',
    category: 'หมวดที่ 2: ตรวจสอบความเข้าใจและเนื้อหา (Content & Comprehension)',
    category_zh: '第二部分：内容理解与掌握 (Content & Comprehension)',
    category_my: 'အပိုင်း ၂ - အကြောင်းအရာ နားလည်သဘောပေါက်မှု (Content & Comprehension)',
    text_th: "ช่วงนี้หัวหน้าได้ยกตัวอย่าง 'เคสอุบัติเหตุ' ที่เพิ่งเกิดขึ้นให้ฟังบ้างไหม? เป็นเรื่องเกี่ยวกับอะไร?",
    text_zh: '最近组长是否有分享近期发生的“事故案例”？是关于什么的？',
    text_my: "လတ်တလော ဖြစ်ပွားခဲ့သော 'မတော်တဆမှု သာဓက' များကို ခေါင်းဆောင်မှ ရှင်းပြဖူးပါသလား? မည်သည့်အကြောင်းအရာဖြစ်သနည်း?",
    max_score: 2,
    active: true
  },
  {
    id: 'Q5',
    category: 'หมวดที่ 3: ตรวจสอบความตระหนักรู้หน้างาน (On-site Awareness)',
    category_zh: '第三部分：现场安全意识 (On-site Awareness)',
    category_my: 'အပိုင်း ၃ - လုပ်ငန်းခွင် အန္တရာယ်သတိပြုမိမှု (On-site Awareness)',
    text_th: 'ในจุดที่คุณยืนทำงานอยู่นี้ มีจุดไหนที่เสี่ยงต่อการเกิดอุบัติเหตุมากที่สุดตามที่หัวหน้าเคยเตือนไว้?',
    text_zh: '在您目前工作的岗位上，组长曾提醒过最容易发生事故的风险点是哪里？',
    text_my: 'သင်လက်ရှိ အလုပ်လုပ်နေသော နေရာတွင် မတော်တဆမှု အဖြစ်နိုင်ဆုံး အန္တရာယ်ရှိသည့်နေရာမှာ မည်သည့်နေရာဖြစ်သည်ဟု ခေါင်းဆောင်မှ သတိပေးထားပါသလဲ?',
    max_score: 2,
    active: true
  },
  {
    id: 'Q6',
    category: 'หมวดที่ 3: ตรวจสอบความตระหนักรู้หน้างาน (On-site Awareness)',
    category_zh: '第三部分：现场安全意识 (On-site Awareness)',
    category_my: 'အပိုင်း ၃ - လုပ်ငန်းခွင် အန္တရာယ်သတိပြုမိမှု (On-site Awareness)',
    text_th: 'ถ้าเจอจุดที่เครื่องจักรหรืออุปกรณ์ดูไม่ปลอดภัย คุณต้องทำอย่างไรเป็นอันดับแรก?',
    text_zh: '如果发现机器或设备存在不安全隐患，您第一步应该怎么做？',
    text_my: 'စက်ပစ္စည်း သို့မဟုတ် ကိရိယာတစ်ခုခု အန္တရာယ်ရှိနေသည်ကို တွေ့ရှိပါက ပထမဆုံး မည်သို့ပြုလုပ်ရမည်နည်း?',
    max_score: 2,
    active: true
  }
];

/**
 * ระบบช่วยแปลคำศัพท์ด้านความปลอดภัยในโรงงาน (ไทย -> จีน / พม่า)
 * สำหรับอำนวยความสะดวกเวลาผู้ใช้งานพิมพ์คำถามใหม่ในหน้าเว็บ
 */
function smartTranslateQuestion(thaiText) {
  if (!thaiText || !thaiText.trim()) {
    return { zh: '', my: '' };
  }

  const dict = [
    {
      keywords: ['ppe', 'อุปกรณ์ป้องกัน', 'หมวก', 'แว่น', 'รองเท้า', 'ถุงมือ'],
      zh: '正确佩戴个人防护装备 (PPE)：',
      my: 'တစ်ကိုယ်ရည်ကာကွယ်ရေးဝတ်စုံ (PPE) ကို စနစ်တကျဝတ်ဆင်ခြင်း - '
    },
    {
      keywords: ['เครื่องจักร', 'เครื่องมือ', 'ตรวจสอบ', 'ก่อนเริ่ม'],
      zh: '作业前检查机器设备与工具安全性：',
      my: 'အလုပ်မစမီ စက်ပစ္စည်းနှင့် ကိရိယာများ စစ်ဆေးခြင်း - '
    },
    {
      keywords: ['5ส', '5s', 'ความสะอาด', 'ระเบียบ', 'ทางเดิน'],
      zh: '保持工作区域整洁与通道畅通 (5S)：',
      my: 'လုပ်ငန်းခွင် သန့်ရှင်းသပ်ရပ်မှုနှင့် 5S လိုက်နာခြင်း - '
    },
    {
      keywords: ['ไฟ', 'ถังดับเพลิง', 'ฉุกเฉิน', 'emergency'],
      zh: '熟悉紧急情况处理与消防安全设备位置：',
      my: 'အရေးပေါ်အခြေအနေနှင့် မီးဘေးလုံခြုံရေး လိုက်နာခြင်း - '
    },
    {
      keywords: ['สารเคมี', 'chemical', 'วัตถุอันตราย'],
      zh: '安全使用与存放化学品及危险品：',
      my: 'ဓာတုပစ္စည်းများကို အန္တရာယ်ကင်းစွာ ကိုင်တွယ်အသုံးပြုခြင်း - '
    },
    {
      keywords: ['ไฟฟ้า', 'สายไฟ', 'ปลั๊ก'],
      zh: '注意用电安全，检查电线与插座无损坏：',
      my: 'လျှပ်စစ်အန္တရာယ် ကင်းရှင်းရေး စစ်ဆေးလိုက်နာခြင်း - '
    },
    {
      keywords: ['ยกของ', 'ท่าทาง', 'ergonomic', 'ปวดหลัง'],
      zh: '使用正确的搬运姿势与人体工学安全操作：',
      my: 'ပစ္စည်းများကို မှန်ကန်သော အနေအထားဖြင့် သယ်ယူရွှေ့ပြောင်းခြင်း - '
    }
  ];

  const lower = thaiText.toLowerCase();
  for (const item of dict) {
    if (item.keywords.some(k => lower.includes(k))) {
      return {
        zh: `${item.zh}${thaiText}`,
        my: `${item.my}${thaiText}`
      };
    }
  }

  return {
    zh: `[安全检查项] ${thaiText}`,
    my: `[လုံခြုံရေးစစ်ဆေးချက်] ${thaiText}`
  };
}
