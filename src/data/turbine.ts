export const turbineModel = [
  {
    fileName: "离心叶轮",
    data: {
      name: "离心叶轮",
      introduction:
        "离心叶轮的功能是在高速旋转的过程中对气流做工。根据叶轮叶片的形状，可以分为直流式、前弯式和后弯式三种基本形式。在航空发动机上，早期采用直流式，目前多采用S形。",
      material: "7071航空铝",
      num: "WP-01",
      weight: 101.5,
      production: "自制件",
    },
  },
  {
    fileName: "扩压器",
    data: {
      name: "扩压器",
      introduction:
        "扩压器用来将经过离心叶轮加速后的高速气流的动能转变化压力能。扩压器的气流通常为扩散形，最常见的类型有两种：管式扩压器和叶片式扩压器。",
      material: "7071航空铝",
      num: "WP-02",
      weight: 98.9,
      production: "自制件",
    },
  },
  {
    fileName: "涡轮",
    data: {
      name: "涡轮",
      introduction:
        "燃气涡轮是航空发动机的重要部件之一，主要功能是把高温、高压燃气的部分热能压力能转化为旋转的机械功，从而带动压气机及其它附件工作。",
      material: "高温合金",
      num: "WP-09",
      weight: 132.2,
      production: "自制件",
    },
  },
  {
    fileName: "导流器",
    data: {
      name: "导流器",
      introduction:
        "导流器是涡轮静子的一部分，燃气通过导流器导向叶片的收敛形通道时，速度增加，压力和温度下降，同时气流的方向也有所改变。因此导流器主要功能是使气流的部分热能转化动能，并以特定的方向流出，推动涡轮转子旋转做工。",
      material: "高温合金",
      num: "WP-08",
      weight: 111.7,
      production: "自制件",
    },
  },
  {
    fileName: "转子",
    data: {
      name: "转子",
      introduction:
        "涡轮和离心叶轮会装配固定一个轴上，高温高压燃气通过导流器后推动涡轮旋转，涡轮通过轴带动离心叶轮旋转进而对空气流进行做功。",
      material: "部件",
      num: "WP-05",
      weight: 300.6,
      production: "自制件",
    },
  },
  {
    fileName: "蒸发器",
    data: {
      name: "蒸发器",
      introduction:
        "燃油管会把然后喷射到蒸发器中，然后进入燃烧室与空气混合燃烧",
      material: "组件",
      num: "WP-12",
      weight: 123.5,
      production: "自制件",
    },
  },
  {
    fileName: "尾喷口",
    data: {
      name: "尾喷口",
      introduction: "经过涡轮的燃气会从微喷口喷出，产生推力，推动飞行器飞行。",
      material: "高温合金",
      num: "WP-06",
      weight: 52.7,
      production: "自制件",
    },
  },
  {
    fileName: "进气口",
    data: {
      name: "进气口",
      introduction: "空气流的进气口，空气流经过进气口后会进入压气机",
      material: "7071航空铝",
      num: "WP-05",
      weight: 86.2,
      production: "自制件",
    },
  },
  {
    fileName: "燃油管",
    data: {
      name: "燃油管",
      introduction: "来自电子阀的燃油经过燃油管喷射到蒸发器中用于燃烧。",
      material: "组件",
      num: "WP-08",
      weight: 9.5,
      production: "自制件",
    },
  },
  {
    fileName: "点火油管",
    data: {
      name: "点火油管",
      introduction: "来自电子阀的燃油经过点火油管喷射到电热塞上用于点火。",
      material: "组件",
      num: "WP-09",
      weight: 9.8,
      production: "自制件",
    },
  },
  {
    fileName: "润滑油管",
    data: {
      name: "润滑油管",
      introduction:
        "通过润滑油管把润滑油喷射到涡喷发动机的角接触轴承用于润滑减少摩擦。",
      material: "组件",
      num: "WP-10",
      weight: 9.6,
      production: "自制件",
    },
  },
  {
    fileName: "电热塞",
    data: {
      name: "电热塞",
      introduction:
        "控制程序通过电流把电热塞加热到高温烧红状态用于涡喷发动机的点火操作中",
      material: "7071航空铝",
      num: "WP-22",
      weight: 21.5,
      production: "外购件",
    },
  },
  {
    fileName: "电磁阀组",
    data: {
      name: "电磁阀组",
      introduction:
        "通过涡喷控制程序，控制电磁阀的开关操作，进而控制燃油的输送。",
      material: "组件",
      num: "WP-18",
      weight: 201.5,
      production: "外购件",
    },
  },
  {
    fileName: "电动机",
    data: {
      name: "电动机",
      introduction:
        "电动机是微型涡喷发动机起动机的一部分，主要在涡喷发动机的启动过程中使用，通过控制程序可以控制电动机的转速。",
      material: "组件",
      num: "WP-21",
      weight: 106.3,
      production: "外购件",
    },
  },
  {
    fileName: "角接触轴承",
    data: {
      name: "角接触轴承",
      introduction:
        "角接触轴承主要用来固定涡喷发动机的转子，涡喷发动机运行的时候，旋转速度很高，同时温度也很高，所以对轴承的质量要求非常高。",
      material: "7071航空铝",
      num: "GB36103",
      weight: 35.5,
      production: "标准件",
    },
  },
  {
    fileName: "热电偶",
    data: {
      name: "热电偶",
      introduction:
        "热电偶传感器适合用于高温测试，在微型涡喷发动机中的作用是用来测试燃烧后高温燃气温度，返回给控制系统。",
      material: "组件",
      num: "WP-13",
      weight: 10.0,
      production: "外购件",
    },
  },
];
