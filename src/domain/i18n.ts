import type { Category, Language } from './model';

const words = {
  zh: {
    app: 'DM 日常管理', home: '首页', inspectionHub: '点检', fourM: '4M 点检', twoHour: '两小时检查', records: '记录', settings: '我的',
    greeting: '把每天的标准动作做好', today: '今日执行', overview: '本班点检概况', fourMProgress: '4M 已完成', twoHourCurrent: '当前两小时检查',
    start: '开始点检', go: '进入检查', seeAll: '查看全部记录', currentWorkshop: '当前车间', shift: '班次', day: '白班', night: '夜班',
    dashboard: 'DM工作台', quickStart: '快捷打卡', currentTimeBlock: '当前时段', shiftRecords: '本班记录', inspectionIntro: '选择点检项目，拍照记录现场状态。',
    person: '人', machine: '机', material: '料', method: '法', personFull: '人员', machineFull: '设备', materialFull: '物料', methodFull: '方法',
    personHint: '出勤、岗位与人员准备', machineHint: '设备状态与保养准备', materialHint: '物料齐套与实物核对', methodHint: '工装夹具与作业方法',
    fourMIntro: '按人、机、料、法逐项打卡。各车间的细分事项将在下一版配置。',
    twoHourIntro: '每两小时做一次现场检查，拍照留存当时状态。',
    notChecked: '待检查', checked: '已检查', normal: '正常', abnormal: '异常', result: '检查结果', evidence: '现场照片',
    photoRequired: '请先拍照或选择照片', photoOptional: '人员照片可选，例如出勤表或请假表', takePhoto: '拍照', choosePhoto: '相册选择', removePhoto: '移除照片', saveProfile: '保存设置',
    note: '补充说明', notePlaceholder: '可记录现场情况或后续处理', abnormalNote: '异常时请填写说明', save: '保存打卡', saved: '已保存',
    nameRequired: '请先在「我的」填写姓名', permission: '需要相机权限才能拍照', photoError: '照片处理失败，请重试', saveError: '保存失败，请重试',
    latest: '最近记录', empty: '还没有点检记录', profile: '使用人', name: '姓名', namePlaceholder: '请输入姓名', workshop: '车间 / 部门', language: '界面语言',
    localOnly: '当前为本机演示版，记录与照片保存在这台设备中。接入 Firebase 后再开启跨设备同步。',
    photoProof: '拍照留证', noPhoto: '暂无照片', selectWorkshop: '请选择车间或部门', currentSlot: '当前时段',
    completed: '本时段已打卡', status: '状态', all: '全部', fourMOnly: '4M', twoHourOnly: '两小时',
    updatedAt: '提交时间', noName: '未填写姓名', demo: '首版演示', detail: '点检详情', noNetwork: '本机保存',
  },
  th: {
    app: 'DM การจัดการประจำวัน', home: 'หน้าหลัก', inspectionHub: 'ตรวจสอบ', fourM: 'ตรวจ 4M', twoHour: 'ตรวจทุก 2 ชั่วโมง', records: 'บันทึก', settings: 'ของฉัน',
    greeting: 'ทำงานตามมาตรฐานทุกวัน', today: 'งานวันนี้', overview: 'ภาพรวมกะนี้', fourMProgress: '4M เสร็จแล้ว', twoHourCurrent: 'ตรวจรอบปัจจุบัน',
    start: 'เริ่มตรวจ', go: 'เริ่มตรวจ', seeAll: 'ดูบันทึกทั้งหมด', currentWorkshop: 'พื้นที่ปัจจุบัน', shift: 'กะ', day: 'กะกลางวัน', night: 'กะกลางคืน',
    dashboard: 'ศูนย์งาน DM', quickStart: 'เริ่มบันทึก', currentTimeBlock: 'ช่วงเวลาปัจจุบัน', shiftRecords: 'บันทึกของกะนี้', inspectionIntro: 'เลือกหัวข้อตรวจและถ่ายภาพสภาพหน้างาน',
    person: 'คน', machine: 'เครื่อง', material: 'วัสดุ', method: 'วิธี', personFull: 'พนักงาน', machineFull: 'เครื่องจักร', materialFull: 'วัสดุ', methodFull: 'วิธีการ',
    personHint: 'การมาทำงานและความพร้อมของคน', machineHint: 'สภาพเครื่องจักรและการบำรุงรักษา', materialHint: 'ความพร้อมของวัสดุ', methodHint: 'อุปกรณ์จับยึดและวิธีทำงาน',
    fourMIntro: 'ตรวจคน เครื่อง วัสดุ และวิธีการ รายการย่อยของแต่ละพื้นที่จะเพิ่มในรุ่นถัดไป',
    twoHourIntro: 'ตรวจพื้นที่ทุกสองชั่วโมง พร้อมถ่ายภาพเป็นหลักฐาน',
    notChecked: 'รอตรวจ', checked: 'ตรวจแล้ว', normal: 'ปกติ', abnormal: 'ผิดปกติ', result: 'ผลการตรวจ', evidence: 'ภาพหลักฐาน',
    photoRequired: 'กรุณาถ่ายหรือเลือกรูปก่อน', photoOptional: 'รูปพนักงานไม่บังคับ เช่น ใบลา หรือใบลงเวลา', takePhoto: 'ถ่ายรูป', choosePhoto: 'เลือกจากคลัง', removePhoto: 'ลบรูป', saveProfile: 'บันทึกการตั้งค่า',
    note: 'หมายเหตุ', notePlaceholder: 'บันทึกสภาพหน้างานหรือการดำเนินการ', abnormalNote: 'กรุณาระบุรายละเอียดเมื่อผิดปกติ', save: 'บันทึกการตรวจ', saved: 'บันทึกแล้ว',
    nameRequired: 'กรุณากรอกชื่อที่หน้า ของฉัน', permission: 'ต้องอนุญาตใช้กล้อง', photoError: 'บันทึกรูปไม่สำเร็จ ลองอีกครั้ง', saveError: 'บันทึกไม่สำเร็จ ลองอีกครั้ง',
    latest: 'บันทึกล่าสุด', empty: 'ยังไม่มีบันทึก', profile: 'ผู้ใช้งาน', name: 'ชื่อ', namePlaceholder: 'กรอกชื่อ', workshop: 'เวิร์กช็อป / แผนก', language: 'ภาษา',
    localOnly: 'รุ่นสาธิตนี้เก็บข้อมูลและรูปในเครื่องนี้ เมื่อเชื่อม Firebase จึงจะซิงก์ข้ามอุปกรณ์',
    photoProof: 'ภาพหลักฐาน', noPhoto: 'ไม่มีรูป', selectWorkshop: 'เลือกพื้นที่หรือแผนก', currentSlot: 'ช่วงเวลาปัจจุบัน',
    completed: 'ตรวจรอบนี้แล้ว', status: 'สถานะ', all: 'ทั้งหมด', fourMOnly: '4M', twoHourOnly: '2 ชั่วโมง',
    updatedAt: 'เวลาบันทึก', noName: 'ยังไม่ระบุชื่อ', demo: 'รุ่นสาธิต', detail: 'รายละเอียด', noNetwork: 'เก็บในเครื่อง',
  },
} as const;

export type TextKey = keyof typeof words.zh;
export function t(language: Language, key: TextKey): string { return words[language][key]; }
export function categoryName(language: Language, category: Category, full = false) {
  return t(language, (full ? `${category}Full` : category) as TextKey);
}
