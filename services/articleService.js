// FILE NAME: d:\Omkar\Water\FDA\services\articleService.js

const ARTICLES = [
  {
    id: 'food-adulteration',
    category: 'food',
    thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60',
    banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&auto=format&fit=crop&q=80',
    title: {
      en: 'How to Detect Adulteration in Milk & Dairy Products',
      mr: 'दूध आणि दुग्धजन्य पदार्थांमधील भेसळ कशी ओळखावी'
    },
    description: {
      en: 'Learn simple tests you can perform at home to identify common adulterants in milk like starch, urea, and detergents.',
      mr: 'स्टार्च, युरिया आणि डिटर्जंट यांसारख्या दुधातील सामान्य भेसळ ओळखण्यासाठी घरी करता येणाऱ्या सोप्या चाचण्या शिका.'
    },
    content: {
      en: [
        {
          type: 'paragraph',
          text: 'Milk is a vital part of our daily diet, but it is also one of the most commonly adulterated food items. Unscrupulous sellers often add water, starch, urea, detergent, or synthetic milk to increase quantity and profit, posing severe risks to public health.'
        },
        {
          type: 'heading',
          text: 'Simple Home Tests for Milk Adulteration'
        },
        {
          type: 'bullet',
          text: 'Water Adulteration: Put a drop of milk on a polished slanted surface. Pure milk flows slowly leaving a white trail. Milk adulterated with water flows instantly without leaving any trace.'
        },
        {
          type: 'bullet',
          text: 'Starch: Add a few drops of Iodine solution to a small sample of boiled milk. If the color turns blue, it indicates the presence of starch.'
        },
        {
          type: 'bullet',
          text: 'Urea: Mix a tablespoon of milk with half a spoon of soybean/arhar powder. Shake well and let it stand. Dip a red litmus paper. If it turns blue, urea is present.'
        },
        {
          type: 'heading',
          text: 'Action Steps'
        },
        {
          type: 'paragraph',
          text: 'If you find consistent adulteration in milk supplied to your household, collect evidence (purchase receipt, sample video) and immediately register a complaint under the Food Safety category using the SafeMaha app.'
        }
      ],
      mr: [
        {
          type: 'paragraph',
          text: 'दूध आपल्या दैनंदिन आहाराचा एक महत्त्वाचा भाग आहे, परंतु त्यात वारंवार भेसळ केली जाते. काही विक्रेते नफा वाढवण्यासाठी दुधात पाणी, स्टार्च, युरिया किंवा डिटर्जंट मिसळतात, ज्यामुळे आरोग्याला गंभीर धोका निर्माण होतो.'
        },
        {
          type: 'heading',
          text: 'दुधातील भेसळ ओळखण्यासाठी सोप्या घरगुती चाचण्या'
        },
        {
          type: 'bullet',
          text: 'पाण्याची भेसळ: गुळगुळीत आणि उतरत्या पृष्ठभागावर दुधाचा एक थेंब टाका. शुद्ध दूध हळूहळू वाहते आणि पांढरा डाग सोडते. पाणी मिसळलेले दूध त्वरित वाहून जाते.'
        },
        {
          type: 'bullet',
          text: 'स्टार्च चाचणी: उकळलेल्या दुधाच्या नमुन्यात आयोडीन द्रावणाचे काही थेंब टाका. रंग निळा झाल्यास दुधात स्टार्चची भेसळ आहे.'
        },
        {
          type: 'bullet',
          text: 'युरिया चाचणी: एका चमचा दुधात अर्धा चमचा सोयाबीन पावडर मिसळा. चांगले हलवून घ्या आणि त्यात लाल लिटमस पेपर टाका. तो निळा झाल्यास युरियाची उपस्थिती स्पष्ट होते.'
        },
        {
          type: 'heading',
          text: 'पुढील पाऊल'
        },
        {
          type: 'paragraph',
          text: 'जर तुमच्या दुधात सातत्याने भेसळ आढळत असेल, तर पुरावा (खरेदी पावती किंवा व्हिडिओ) गोळा करा आणि सेफमहा ॲपचा वापर करून अन्न सुरक्षा श्रेणीत तक्रार नोंदवा.'
        }
      ]
    }
  },
  {
    id: 'fake-medicine',
    category: 'drug',
    thumbnail: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60',
    banner: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=1000&auto=format&fit=crop&q=80',
    title: {
      en: 'Spotting Fake Medicines: Read the Packaging Label',
      mr: 'बनावट औषधे ओळखणे: पॅकेजिंग लेबल काळजीपूर्वक वाचा'
    },
    description: {
      en: 'Critical guide on identifying counterfeit drugs by cross-checking batch numbers, manufacturer details, and QR codes.',
      mr: 'बॅच नंबर, उत्पादक तपशील आणि क्यूआर कोड तपासून बनावट औषधे ओळखण्याबाबत मार्गदर्शक माहिती.'
    },
    content: {
      en: [
        {
          type: 'paragraph',
          text: 'Counterfeit and substandard medicines present a global health hazard. They may contain no active ingredients, incorrect dosages, or toxic compounds. Vigilant checking of drug packaging before purchase is your primary defense.'
        },
        {
          type: 'heading',
          text: 'What to Look For on Medicine Strip/Bottle'
        },
        {
          type: 'bullet',
          text: 'Spelling Errors: Counterfeiters often make spelling mistakes in the brand name, active ingredients, or manufacturer address.'
        },
        {
          type: 'bullet',
          text: 'Unique QR Codes: Most prescription and high-value drugs now carry a 2D matrix code (QR code) containing the registration data. Scan it to verify legitimacy.'
        },
        {
          type: 'bullet',
          text: 'Seal Integrity: Ensure the bottle seal is unbroken and that security holograms on strip packs are fully intact and clear.'
        },
        {
          type: 'heading',
          text: 'Verification and Billing'
        },
        {
          type: 'paragraph',
          text: 'Never buy medicines without a valid printed tax invoice. The invoice must list the pharmacist\'s FDA license number, batch details, expiry dates, and unit prices. This invoice is your primary proof of transaction.'
        }
      ],
      mr: [
        {
          type: 'paragraph',
          text: 'बनावट आणि निकृष्ट औषधे मानवी आरोग्यासाठी अत्यंत घातक आहेत. त्यामध्ये औषधाचा मुख्य घटक नसणे किंवा चुकीच्या प्रमाणात असणे यांसारखे धोके असू शकतात. खरेदीपूर्वी औषधाची तपासणी करणे हे सर्वात मोठे संरक्षण आहे.'
        },
        {
          type: 'heading',
          text: 'औषध खरेदी करताना काय तपासावे?'
        },
        {
          type: 'bullet',
          text: 'स्पेलिंग मधील चुका: बनावट औषधांच्या पाकिटांवर किंवा बाटल्यांवर ब्रँड नाव किंवा उत्पादकाच्या पत्त्यामध्ये स्पेलिंगच्या चुका आढळतात.'
        },
        {
          type: 'bullet',
          text: 'क्यूआर कोड (QR Code): अनेक महत्त्वाच्या औषधांवर २D मॅट्रिक्स कोड असतो. मोबाईलने तो स्कॅन करून औषधाची सत्यता तपासता येते.'
        },
        {
          type: 'bullet',
          text: 'सीलबंद पॅकिंग: बाटलीचे सील तुटलेले नाही आणि औषधांच्या पट्टीवरील होलोग्राम व्यवस्थित आणि चमकदार असल्याची खात्री करा.'
        },
        {
          type: 'heading',
          text: 'पक्के बिल आवश्यक'
        },
        {
          type: 'paragraph',
          text: 'पक्के जीएसटी बिल असल्याशिवाय कधीही औषधे खरेदी करू नका. बिलावर औषध दुकानाचा परवाना क्रमांक (FDA License No), औषधाचा बॅच क्रमांक आणि मुदत समाप्ती तारीख (Expiry Date) स्पष्ट लिहिलेली असावी.'
        }
      ]
    }
  },
  {
    id: 'cosmetic-safety-rules',
    category: 'cosmetics',
    thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=60',
    banner: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000&auto=format&fit=crop&q=80',
    title: {
      en: 'Toxins in Cosmetics: Ingredients to Avoid',
      mr: 'सौंदर्यप्रसाधनांमधील विषारी घटक: काय टाळावे'
    },
    description: {
      en: 'Unmask the hidden chemicals in makeup and skincare. Learn about parabens, phthalates, and heavy metals.',
      mr: 'मेकअप आणि त्वचेच्या उत्पादनांमधील लपलेली रसायने ओळखा. पॅराबेन्स, थॅलेट्स आणि जड धातूंबद्दल माहिती मिळवा.'
    },
    content: {
      en: [
        {
          type: 'paragraph',
          text: 'Cosmetics and personal care products are applied directly to the skin, which absorbs substances into the bloodstream. Certain common chemicals added as preservatives or fragrances are associated with allergies, hormonal imbalances, and long-term health complications.'
        },
        {
          type: 'heading',
          text: 'Critical Ingredients to Steer Clear Of'
        },
        {
          type: 'bullet',
          text: 'Parabens: Used as preservatives, they mimic estrogen in the body and are linked to endocrine disruption.'
        },
        {
          type: 'bullet',
          text: 'Formaldehyde releasers: Common in low-grade shampoos, body washes, and nail polishes. Known carcinogens and skin irritants.'
        },
        {
          type: 'bullet',
          text: 'Lead & Heavy Metals: Found in unapproved lipsticks, eye shadows, and traditional kohl. Heavy metals accumulate in organs over time.'
        },
        {
          type: 'heading',
          text: 'Safety Recommendation'
        },
        {
          type: 'paragraph',
          text: 'Always check if the cosmetic brand is licensed by the FDA and clearly states all ingredients. Be careful of cheap, unbranded cosmetics sold on street sides as they are rarely safety-tested.'
        }
      ],
      mr: [
        {
          type: 'paragraph',
          text: 'सौंदर्यप्रसाधने आणि वैयक्तिक काळजीची उत्पादने थेट त्वचेवर लावली जातात, ज्यातून रसायने शरीरात शोषली जातात. प्रसाधनांमध्ये टिकवणारे घटक (Preservatives) किंवा सुवासासाठी वापरण्यात येणारी रसायने ॲलर्जी आणि संप्रेरकांचे असंतुलन निर्माण करू शकतात.'
        },
        {
          type: 'heading',
          text: 'टाळायचे महत्त्वाचे घटक'
        },
        {
          type: 'bullet',
          text: 'पॅराबेन्स (Parabens): बुरशी आणि जिवाणू टाळण्यासाठी वापरले जाते, परंतु ते संप्रेरक (Hormone) संतुलन बिघडवू शकते.'
        },
        {
          type: 'bullet',
          text: 'फॉर्मल्डिहाइड रिलीजर्स: हलक्या दर्जाचे शॅम्पू आणि नेलपॉलिशमध्ये आढळणारे हे घटक कर्करोगास कारणीभूत ठरू शकतात.'
        },
        {
          type: 'bullet',
          text: 'शिसे (Lead) व जड धातू: स्थानिक स्तरावर बनणाऱ्या लिपस्टिक आणि काजळामध्ये शिसे आढळण्याची शक्यता असते, जे मेंदू आणि अवयवांसाठी घातक आहे.'
        },
        {
          type: 'heading',
          text: 'सुरक्षिततेचा सल्ला'
        },
        {
          type: 'paragraph',
          text: 'नेहमी सौंदर्यप्रसाधनांवर घटक सूची (Ingredients) आणि एफडीए परवाना क्रमांक असल्याची खात्री करा. रस्त्यावर मिळणारी स्वस्त, नाव नसलेली सौंदर्यप्रसाधने वापरणे टाळा.'
        }
      ]
    }
  },
  {
    id: 'consumer-rights-invoice',
    category: 'rights',
    thumbnail: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=500&auto=format&fit=crop&q=60',
    banner: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1000&auto=format&fit=crop&q=80',
    title: {
      en: 'Your Right to a Bill: The Foundation of Legal Recourse',
      mr: 'बिलाचा तुमचा हक्क: कायदेशीर कारवाईचा पाया'
    },
    description: {
      en: 'Understand why demanding a proper bill is your right as a consumer and how it serves as primary evidence in courts.',
      mr: 'ग्राहकांना योग्य बिल मिळणे हा त्यांचा हक्क का आहे आणि ते न्यायालयात मुख्य पुरावा म्हणून कसे कार्य करते ते समजून घ्या.'
    },
    content: {
      en: [
        {
          type: 'paragraph',
          text: 'Every consumer has the fundamental right to receive a bill or printed invoice for goods and services purchased. Shopkeepers refusing to issue bills is a major offense under consumer protection laws.'
        },
        {
          type: 'heading',
          text: 'Why a Bill is Mandatory for FDA Complaints'
        },
        {
          type: 'bullet',
          text: 'Establishment of Purchase: A bill proves that the specific batch of product was purchased from that exact retailer on the mentioned date.'
        },
        {
          type: 'bullet',
          text: 'Batch Number Tracking: If the product is defective or adulterated, the FDA uses the batch number on the bill to trace and recall the entire batch from supply chains.'
        },
        {
          type: 'bullet',
          text: 'Legal Liability: It prevents shopkeepers from denying that you purchased the counterfeit drug or food item from their establishment.'
        },
        {
          type: 'heading',
          text: 'Always Remember'
        },
        {
          type: 'paragraph',
          text: 'Do not accept handwritten estimates or "kachha bills" as they do not have legal status. A valid bill must contain GSTIN, invoice number, address, license details, and signatures.'
        }
      ],
      mr: [
        {
          type: 'paragraph',
          text: 'प्रत्येक ग्राहकाला खरेदी केलेल्या वस्तू किंवा सेवांचे पक्के बिल मिळवण्याचा मूलभूत अधिकार आहे. बिल देण्यास नकार देणे हा ग्राहक संरक्षण कायद्यांतर्गत मोठा गुन्हा आहे.'
        },
        {
          type: 'heading',
          text: 'एफडीएकडे तक्रार करण्यासाठी बिल का आवश्यक आहे?'
        },
        {
          type: 'bullet',
          text: 'खरेदीची सिद्धता: बिल हे सिद्ध करते की तुम्ही विशिष्ट वस्तू त्याच दुकानातून आणि त्याच दिवशी खरेदी केली आहे.'
        },
        {
          type: 'bullet',
          text: 'बॅच नंबरचा माग: उत्पादन खराब किंवा भेसळयुक्त असल्यास, एफडीए बिलावरील बॅच क्रमांकाच्या आधारे संपूर्ण साठा बाजारातून जप्त करते.'
        },
        {
          type: 'bullet',
          text: 'कायदेशीर दायित्व: हे दुकानदाराला मुकरण्यापासून रोखते की उत्पादन त्याच्या दुकानातील नव्हते.'
        },
        {
          type: 'heading',
          text: 'नेहमी लक्षात ठेवा'
        },
        {
          type: 'paragraph',
          text: 'कच्चे किंवा हस्तलिखित बिल स्वीकारू नका. अधिकृत बिलावर जीएसटी क्रमांक (GSTIN), दुकानाचा परवाना क्रमांक, अनुक्रमांक आणि स्वाक्षरी असणे गरजेचे आहे.'
        }
      ]
    }
  }
];

/**
 * Fetch all articles, optionally filtered by category.
 * @param {string} category Category to filter ('food', 'drug', 'cosmetics', 'rights')
 * @returns {Array} List of article cards
 */
export const getArticles = (category) => {
  if (!category || category === 'all') {
    return ARTICLES;
  }
  return ARTICLES.filter((article) => article.category === category);
};

/**
 * Fetch a single article content by ID.
 * @param {string} id Unique article ID
 * @returns {object|null} Article object
 */
export const getArticleById = (id) => {
  const found = ARTICLES.find((article) => article.id === id);
  return found || null;
};
