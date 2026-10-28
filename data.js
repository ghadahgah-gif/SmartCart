// أقسام السوبرماركت — col/row: مكان الممر على خريطة المتجر (4 أعمدة × صفّين)
const SECTIONS = [
  { id: 'A', name: 'خضروات وفواكه',   short: 'خضار وفواكه', icon: '🥦', tile: '🍎🥦', col: 0, row: 0 },
  { id: 'C', name: 'ألبان وأجبان',    short: 'ألبان',       icon: '🧀', tile: '🧀🥛', col: 1, row: 0 },
  { id: 'B', name: 'مخبوزات',         short: 'مخبوزات',     icon: '🥖', tile: '🥖',   col: 2, row: 0 },
  { id: 'G', name: 'بقالة ومعلبات',   short: 'بقالة',       icon: '🥫', tile: '🍚🥫', col: 3, row: 0 },
  { id: 'H', name: 'منظفات',          short: 'منظفات',      icon: '🧴', tile: '🧴',   col: 0, row: 1 },
  { id: 'F', name: 'سناكس وحلويات',   short: 'سناكس',       icon: '🍫', tile: '🍫🍪', col: 1, row: 1 },
  { id: 'E', name: 'مشروبات',         short: 'مشروبات',     icon: '🥤', tile: '🥤',   col: 2, row: 1 },
  { id: 'D', name: 'لحوم ودواجن',     short: 'لحوم',        icon: '🥩', tile: '🥩🍗', col: 3, row: 1 },
];

// منتجات السوبرماركت — الأسعار بالريال السعودي (تقريبية لأغراض العرض)
// per:   يظهر بجانب السعر للمنتجات التي تُباع بالوزن ("/ كجم")
// img:   مسار صورة المنتج الحقيقية (مثلاً 'images/apple.jpg') — إذا كان فارغاً يظهر الرمز
// group: منتجات من نفس النوع — تُستخدم لاقتراح البدائل
// look:  منتجات متشابهة الشكل — إذا لم تتأكد الكاميرا تسأل المتسوق أيّها أضاف
// note:  سبب اقتراح المنتج كبديل
const PRODUCTS = [
  // ===== A — خضروات وفواكه =====
  { id: 1,  name: 'تفاح أحمر رويال قالا', brand: 'فواكه طازجة', size: '1 كجم', per: 'كجم', price: 8.95, origin: 'إيطاليا', emoji: '🍎', img: '', section: 'A', available: true, group: 'fruit',
    desc: 'تفاح أحمر مقرمش وحلو الطعم، مناسب للأكل الطازج والسلطات.', keywords: ['تفاح'] },
  { id: 2,  name: 'موز', brand: 'شيكيتا', size: '1 كجم', per: 'كجم', price: 6.95, origin: 'الإكوادور', emoji: '🍌', img: '', section: 'A', available: true, group: 'fruit',
    desc: 'موز ناضج غني بالبوتاسيوم، مثالي للفطور والعصائر.', keywords: ['موز', 'شيكيتا'] },
  { id: 29, name: 'برتقال للعصير', brand: 'فواكه طازجة', size: '1 كجم', per: 'كجم', price: 5.95, origin: 'مصر', emoji: '🍊', img: '', section: 'A', available: true, group: 'fruit',
    desc: 'برتقال عصيري حلو، مناسب للعصير الطازج.', keywords: ['برتقال'] },
  { id: 4,  name: 'أفوكادو هاس', brand: 'فواكه طازجة', size: 'حبتين', price: 12.95, origin: 'كينيا', emoji: '🥑', img: '', section: 'A', available: false, group: 'fruit',
    desc: 'أفوكادو كريمي القوام، ممتاز للتوست والسلطات.', keywords: ['افوكادو'] },
  { id: 3,  name: 'طماطم محلية', brand: 'خضار طازجة', size: '1 كجم', per: 'كجم', price: 4.95, origin: 'السعودية', emoji: '🍅', img: '', section: 'A', available: true, group: 'veg',
    desc: 'طماطم حمراء من مزارع محلية، تصل يومياً للمتجر.', keywords: ['طماطم', 'بندوره'] },
  { id: 5,  name: 'خيار محلي', brand: 'خضار طازجة', size: '1 كجم', per: 'كجم', price: 5.50, origin: 'السعودية', emoji: '🥒', img: '', section: 'A', available: true, group: 'veg',
    desc: 'خيار طازج ومقرمش من البيوت المحمية المحلية.', keywords: ['خيار'] },
  { id: 30, name: 'بروكلي', brand: 'خضار طازجة', size: '500 جم', price: 7.95, origin: 'الأردن', emoji: '🥦', img: '', section: 'A', available: true, group: 'veg',
    desc: 'بروكلي أخضر طازج، مناسب للسلق والشوي.', keywords: ['بروكلي'] },

  // ===== B — مخبوزات =====
  { id: 6,  name: 'خبز توست أبيض', brand: 'لوزين', size: '600 جم', price: 6.00, origin: 'السعودية', emoji: '🍞', img: '', section: 'B', available: true, group: 'bread', look: 'toast',
    desc: 'توست أبيض طري بشرائح متساوية، مناسب للساندويتشات والفطور.', keywords: ['خبز', 'توست', 'لوزين'] },
  { id: 31, name: 'خبز بر', brand: 'لوزين', size: '600 جم', price: 4.50, origin: 'السعودية', emoji: '🍞', img: '', section: 'B', available: true, group: 'bread', look: 'toast',
    desc: 'توست أسمر من القمح الكامل، غني بالألياف.', keywords: ['خبز', 'بر', 'اسمر', 'توست', 'لوزين'] },
  { id: 8,  name: 'خبز صامولي', brand: 'مخبز المتجر', size: '4 حبات', price: 3.50, origin: 'السعودية', emoji: '🥖', img: '', section: 'B', available: true, group: 'bread',
    desc: 'صامولي طازج يُخبز في المتجر كل صباح.', keywords: ['خبز', 'صامولي', 'باغيت'] },
  { id: 7,  name: 'كرواسون بالزبدة', brand: 'لوزين', size: '6 حبات', price: 11.50, origin: 'السعودية', emoji: '🥐', img: '', section: 'B', available: false, group: 'bread',
    desc: 'كرواسون هش بطبقات الزبدة، يُسخّن دقيقتين ويصير جاهز.', keywords: ['كرواسون', 'لوزين'] },

  // ===== C — ألبان وأجبان =====
  { id: 32, name: 'حليب طازج 1 لتر', brand: 'المراعي', size: '1 لتر', price: 5.50, origin: 'السعودية', emoji: '🥛', img: '', section: 'C', available: true, group: 'milk', look: 'milk',
    desc: 'حليب بقري طازج كامل الدسم، يُحفظ مبرداً ويُستهلك خلال 3 أيام من الفتح.', keywords: ['حليب', 'المراعي'] },
  { id: 9,  name: 'حليب طازج 2 لتر', brand: 'المراعي', size: '2 لتر', price: 11.50, origin: 'السعودية', emoji: '🥛', img: '', section: 'C', available: true, group: 'milk', look: 'milk',
    desc: 'حليب بقري طازج كامل الدسم بعبوة عائلية.', keywords: ['حليب', 'المراعي'] },
  { id: 10, name: 'جبن شيدر 200 غ', brand: 'كرافت', size: '200 جم', price: 11.90, origin: 'أستراليا', emoji: '🧀', img: '', section: 'C', available: true, group: 'cheese', look: 'cheddar', note: 'طعم مشابه',
    desc: 'جبن شيدر بطعم غني، مناسب للساندويتشات والطبخ.', keywords: ['جبن', 'جبنه', 'شيدر', 'كرافت'] },
  { id: 33, name: 'جبن شيدر 400 غ', brand: 'كرافت', size: '400 جم', price: 19.90, origin: 'أستراليا', emoji: '🧀', img: '', section: 'C', available: true, group: 'cheese', look: 'cheddar', note: 'حجم أكبر',
    desc: 'نفس جبن الشيدر بعبوة أكبر وسعر أوفر للكيلو.', keywords: ['جبن', 'جبنه', 'شيدر', 'كرافت'] },
  { id: 34, name: 'شيدر خفيف 200 غ', brand: 'كرافت', size: '200 جم', price: 12.50, origin: 'أستراليا', emoji: '🧀', img: '', section: 'C', available: true, group: 'cheese', look: 'cheddar', note: 'دهون أقل',
    desc: 'جبن شيدر قليل الدسم.', keywords: ['جبن', 'جبنه', 'شيدر', 'خفيف', 'لايت'] },
  { id: 35, name: 'جبن موزاريلا 250 غ', brand: 'المراعي', size: '250 جم', price: 12.50, origin: 'السعودية', emoji: '🧀', img: '', section: 'C', available: false, group: 'cheese',
    desc: 'موزاريلا مبشورة للبيتزا والمعجنات.', keywords: ['جبن', 'جبنه', 'موزاريلا', 'موزريلا'] },
  { id: 36, name: 'جبن حلوم 225 غ', brand: 'بيتاس', size: '225 جم', price: 14.25, origin: 'قبرص', emoji: '🧀', img: '', section: 'C', available: true, group: 'cheese', note: 'مناسب للطبخ',
    desc: 'حلوم قبرصي يُشوى أو يُقلى دون أن يذوب.', keywords: ['جبن', 'جبنه', 'حلوم', 'حلومي'] },
  { id: 11, name: 'جبن كريمي 180 غ', brand: 'بوك', size: '180 جم', price: 9.75, origin: 'الدنمارك', emoji: '🥣', img: '', section: 'C', available: true, group: 'cheese', note: 'قابل للدهن',
    desc: 'جبنة قابلة للدهن بقوام ناعم، مناسبة للفطور والمعجنات.', keywords: ['جبن', 'جبنه', 'كريمي', 'بوك'] },
  { id: 37, name: 'جبن نباتي 200 غ', brand: 'فايولايف', size: '200 جم', price: 18.50, origin: 'اليونان', emoji: '🥬', img: '', section: 'C', available: true, group: 'cheese', note: 'خيار خالٍ من الألبان',
    desc: 'بديل نباتي للجبن مصنوع من زيت جوز الهند.', keywords: ['جبن', 'جبنه', 'نباتي'] },
  { id: 12, name: 'بيض طازج كبير', brand: 'الوطنية', size: '30 حبة', price: 21.95, origin: 'السعودية', emoji: '🥚', img: '', section: 'C', available: true, group: 'eggs',
    desc: 'بيض طازج حجم كبير من مزارع الوطنية.', keywords: ['بيض', 'الوطنيه'] },

  // ===== D — لحوم ودواجن =====
  { id: 13, name: 'صدر دجاج 1 كجم', brand: 'الوطنية', size: '1 كجم', per: 'كجم', price: 32.00, origin: 'السعودية', emoji: '🍗', img: '', section: 'D', available: true, group: 'chicken',
    desc: 'صدور دجاج بدون عظم وجلد، طازجة غير مجمدة.', keywords: ['دجاج', 'صدر', 'الوطنيه'] },
  { id: 38, name: 'دجاج كامل طازج', brand: 'الوطنية', size: '1 كجم', price: 17.95, origin: 'السعودية', emoji: '🍗', img: '', section: 'D', available: true, group: 'chicken',
    desc: 'دجاجة كاملة طازجة، مناسبة للشوي والكبسة.', keywords: ['دجاج', 'دجاجه', 'الوطنيه'] },
  { id: 14, name: 'لحم مفروم 500 غ', brand: 'ملحمة المتجر', size: '500 جم', price: 24.50, origin: 'أستراليا', emoji: '🥩', img: '', section: 'D', available: true, group: 'beef',
    desc: 'لحم بقري مفروم قليل الدهن، مناسب للبرجر والكفتة.', keywords: ['لحم', 'مفروم'] },
  { id: 15, name: 'ستيك لحم بقري', brand: 'ملحمة المتجر', size: '400 جم', price: 49.95, origin: 'أستراليا', emoji: '🥩', img: '', section: 'D', available: false, group: 'beef',
    desc: 'قطع ستيك بقري طرية للشوي على الصاج أو الفحم.', keywords: ['لحم', 'ستيك'] },

  // ===== E — مشروبات =====
  { id: 16, name: 'عصير برتقال 1.5 لتر', brand: 'المراعي', size: '1.5 لتر', price: 9.75, origin: 'السعودية', emoji: '🧃', img: '', section: 'E', available: true, group: 'juice',
    desc: 'عصير برتقال 100% بدون سكر مضاف.', keywords: ['عصير', 'برتقال', 'المراعي'] },
  { id: 17, name: 'مياه شرب', brand: 'نوفا', size: '12 × 330 مل', price: 6.50, origin: 'السعودية', emoji: '💧', img: '', section: 'E', available: true, group: 'water',
    desc: 'كرتون مياه شرب نقية بعبوات صغيرة سهلة الحمل.', keywords: ['ماء', 'مويه', 'مياه', 'نوفا'] },
  { id: 18, name: 'قهوة عربية بالهيل', brand: 'باجة', size: '250 جم', price: 24.95, origin: 'السعودية', emoji: '☕', img: '', section: 'E', available: true, group: 'coffee',
    desc: 'قهوة عربية شقراء محمصة ومطحونة مع الهيل، جاهزة للدلة.', keywords: ['قهوه', 'باجه'] },
  { id: 19, name: 'شاي أسود العلامة الصفراء', brand: 'ليبتون', size: '100 كيس', price: 17.95, origin: 'كينيا', emoji: '🍵', img: '', section: 'E', available: false, group: 'tea',
    desc: 'أكياس شاي أسود بطعم قوي، 100 كيس في العلبة.', keywords: ['شاي', 'ليبتون'] },
  { id: 39, name: 'شاي أسود', brand: 'ربيع', size: '100 كيس', price: 15.95, origin: 'سريلانكا', emoji: '🍵', img: '', section: 'E', available: true, group: 'tea', note: 'نفس النوع بسعر أقل',
    desc: 'شاي أسود فاخر، 100 كيس في العلبة.', keywords: ['شاي', 'ربيع'] },

  // ===== F — سناكس وحلويات =====
  { id: 20, name: 'شوكولاتة بالحليب', brand: 'جالكسي', size: '90 جم', price: 6.50, origin: 'المملكة المتحدة', emoji: '🍫', img: '', section: 'F', available: true, group: 'choco',
    desc: 'لوح شوكولاتة ناعمة بالحليب.', keywords: ['شوكولاته', 'شوكولا', 'جالكسي'] },
  { id: 21, name: 'شيبس بالملح', brand: 'ليز', size: '170 جم', price: 8.50, origin: 'السعودية', emoji: '🍟', img: '', section: 'F', available: true, group: 'chips',
    desc: 'رقائق بطاطس مقرمشة بنكهة الملح، حجم عائلي.', keywords: ['شيبس', 'بطاطس', 'ليز'] },
  { id: 22, name: 'كوكيز بقطع الشوكولاتة', brand: 'تشيبس أهوي', size: '200 جم', price: 11.95, origin: 'البحرين', emoji: '🍪', img: '', section: 'F', available: false, group: 'biscuit',
    desc: 'كوكيز مقرمش مليان قطع شوكولاتة.', keywords: ['كوكيز', 'بسكويت'] },
  { id: 23, name: 'معمول بالتمر', brand: 'مخبز المتجر', size: '12 حبة', price: 9.95, origin: 'السعودية', emoji: '🍪', img: '', section: 'F', available: true, group: 'biscuit', note: 'حلى مع القهوة',
    desc: 'معمول محشي بعجينة التمر، مناسب مع القهوة العربية.', keywords: ['بسكويت', 'معمول', 'تمر'] },

  // ===== G — بقالة ومعلبات =====
  { id: 24, name: 'أرز بسمتي 5 كجم', brand: 'أبو كاس', size: '5 كجم', price: 49.95, origin: 'الهند', emoji: '🍚', img: '', section: 'G', available: true, group: 'rice',
    desc: 'أرز بسمتي حبة طويلة، مناسب للكبسة والمندي.', keywords: ['رز', 'ارز', 'ابو كاس'] },
  { id: 40, name: 'أرز بسمتي 5 كجم', brand: 'الوليمة', size: '5 كجم', price: 44.95, origin: 'الهند', emoji: '🍚', img: '', section: 'G', available: true, group: 'rice', note: 'سعر أقل',
    desc: 'أرز بسمتي فاخر محبب للكبسة.', keywords: ['رز', 'ارز', 'الوليمه'] },
  { id: 25, name: 'معكرونة سباغيتي', brand: 'قودي', size: '500 جم', price: 4.50, origin: 'السعودية', emoji: '🍝', img: '', section: 'G', available: true, group: 'pasta',
    desc: 'سباغيتي من القمح القاسي، تنطبخ خلال 9 دقائق.', keywords: ['معكرونه', 'مكرونه', 'باستا', 'سباغيتي', 'قودي'] },
  { id: 26, name: 'تونة قطع خفيفة', brand: 'قودي', size: '3 × 185 جم', price: 17.95, origin: 'تايلاند', emoji: '🥫', img: '', section: 'G', available: true, group: 'tuna',
    desc: 'تونة قطع في زيت دوار الشمس، 3 علب.', keywords: ['تونه', 'قودي'] },

  // ===== H — منظفات =====
  { id: 27, name: 'سائل غسيل صحون', brand: 'فيري', size: '1 لتر', price: 10.95, origin: 'السعودية', emoji: '🧴', img: '', section: 'H', available: true, group: 'dish',
    desc: 'سائل مركّز يزيل الدهون بسرعة، رائحة الليمون.', keywords: ['صابون', 'سائل', 'صحون', 'فيري'] },
  { id: 41, name: 'مسحوق غسيل', brand: 'تايد', size: '2.5 كجم', price: 34.95, origin: 'السعودية', emoji: '🧺', img: '', section: 'H', available: true, group: 'laundry',
    desc: 'مسحوق غسيل للغسالات الأوتوماتيك.', keywords: ['غسيل', 'مسحوق', 'تايد'] },
  { id: 28, name: 'مناديل ورقية', brand: 'فاين', size: '5 علب × 200', price: 19.95, origin: 'السعودية', emoji: '🧻', img: '', section: 'H', available: true, group: 'tissue',
    desc: 'مناديل ناعمة بطبقتين، 5 علب في الباكيت.', keywords: ['مناديل', 'فاين'] },
];
