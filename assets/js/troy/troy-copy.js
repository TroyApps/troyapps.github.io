const COPY = Object.freeze({
  tr: Object.freeze({
    tools: Object.freeze({
      poke: Object.freeze({ label: "Dürt", targetLabel: "Troy'u dürt" }),
      bazooka: Object.freeze({ label: "Bazuka", targetLabel: "Troy'un bazukasını ateşle" }),
      whip: Object.freeze({ label: "Kırbaç", targetLabel: "Troy'a kırbaç darbesi uygula" }),
      command: Object.freeze({ label: "Komut Ver", targetLabel: "Troy'a komut ver" }),
    }),
    commands: Object.freeze({
      apps: "Uygulamaları göster",
      radar: "Radar'a götür",
      about: "Biz kimiz?",
      contact: "İletişimi aç",
    }),
    dialogue: Object.freeze({
      idle: Object.freeze([
        "Bir görev ver. Zincir saymaktan sıkıldım.",
        "Sistem çalışıyor. Ben istemeden de olsa.",
        "Ben Troy. Sen düşünürken ben yaşlanıyorum.",
      ]),
      talk: Object.freeze([
        "Ne lazım, söyle. Hevesli görünmeden hallederim.",
        "Buyur efendim... Bu hitaba alışma.",
        "Komutunu kısa tut; sabrım deneme sürümü.",
      ]),
      point: Object.freeze([
        "Şuradan git. Kaybolursan tanışmıyoruz.",
        "İşe yarayan şeyler orada. Gözünü dört aç.",
        "Menü şurada. Bensiz iki adım zor, değil mi?",
      ]),
      annoyed: Object.freeze([
        "Hâlâ mı düşünüyorsun? Ben bile sabırsızlandım.",
        "Bir iş ver; boş durunca iyi fikirler gelmiyor.",
        "Bu kadar gezinmek de bir yetenek sayılır herhalde.",
      ]),
      pokeSurprised: Object.freeze([
        "Hıh?! Kalbim yok ama ödüm koptu.",
        "Hey! Buradayım, yoklama almana gerek yok.",
        "Ayy! Bir işin varsa söyle, dürtüp kaçma.",
      ]),
      pokeAnnoyed: Object.freeze([
        "Parmağın çalışıyor, evet. Şimdi beynini deneyelim.",
        "Tamam, hissettim. İkinci bilimsel deney gerekli miydi?",
        "Dürtme tuşunu çözdün. Sırada siteyi kullanmak var.",
      ]),
      pokeDefensive: Object.freeze([
        "Bir daha dürt... Isırmam. Belki.",
        "O parmak yine gelirse görevlerin yavaş kuyruğa girer.",
        "Çağırmanın medeni yolları var. Ben medeni değilim, o ayrı.",
      ]),
      bazooka: Object.freeze([
        "Çekil önümden. Fizikle kişisel meselem var.",
        "Hedef kilitli! Umarım ben değilimdir.",
        "Plan kusursuz. Bunu daha önce de söylemiş olabilirim.",
      ]),
      bazookaImpact: Object.freeze([
        "Lanet olsun... Yine aynısı oluyor!",
      ]),
      pixelScattered: Object.freeze([
        "Tamam, kazandın. Şimdi tıkla da kimse görmeden kalkayım.",
        "Bakıp durma! Beni birleştir... Rica sayma.",
        "Şu piksellere tıkla da seni yakından küçümseyebileyim.",
        "Bu hâlimle bile senden daha derli topluyum; hadi.",
      ]),
      reforming: Object.freeze([
        "Hiçbir şey olmadı. Gördüklerini de unut.",
        "Plan buydu. Ayrıntılara takılma.",
      ]),
      whipSurprised: Object.freeze([
        "Oha kovboy! Mesaiye geldik, rodeoya değil.",
        "Kırbaç mı? İnsan kaynakları yine izinli galiba.",
        "Tamam tamam! Komutu söyle de işe yarasın.",
      ]),
      whipAnnoyed: Object.freeze([
        "Kırbaçla motivasyon mu? Taş devri İK'sı.",
        "Şimdi işi kişiselleştirmeye başladın.",
        "Onu bırak; sabrımın garanti süresi doluyor.",
      ]),
      whipDefensive: Object.freeze([
        "Onu bir daha savurursan düğüm atıp geri yollarım.",
        "Yakaladım. Bu numara artık bende.",
        "Havada kestim. Şimdi adam gibi komut ver.",
      ]),
      acknowledge: Object.freeze([
        "Buyur, hallettim. Şaşırmış gibi görünme.",
        "Şuradan başla. Kaybolursan sorumluluk kabul etmiyorum.",
        "Peki peki, yolu açıyorum...",
      ]),
      recover: Object.freeze([
        "Tamam, gösteri bitti. İşimize dönelim.",
        "Ayaktayım. Moral bozmak yok.",
        "Sistem çalışıyor. Benim gurur biraz çizildi, o kadar.",
      ]),
    }),
  }),
  en: Object.freeze({
    tools: Object.freeze({
      poke: Object.freeze({ label: "Poke", targetLabel: "Poke Troy" }),
      bazooka: Object.freeze({ label: "Bazooka", targetLabel: "Fire Troy's bazooka" }),
      whip: Object.freeze({ label: "Whip", targetLabel: "Whip Troy" }),
      command: Object.freeze({ label: "Command", targetLabel: "Give Troy a command" }),
    }),
    commands: Object.freeze({
      apps: "Show the apps",
      radar: "Take me to Radar",
      about: "Who are we?",
      contact: "Open contact",
    }),
    dialogue: Object.freeze({
      idle: Object.freeze([
        "Give me a task. I'm tired of counting chain links.",
        "The system works. Despite my best efforts.",
        "I'm Troy. I age while you make up your mind.",
      ]),
      talk: Object.freeze([
        "Tell me what you need. I'll handle it without looking eager.",
        "At your service... Don't get used to that.",
        "Keep the command short; my patience is a trial version.",
      ]),
      point: Object.freeze([
        "Go that way. If you get lost, we've never met.",
        "The useful stuff is over there. Keep your eyes open.",
        "The menu is right there. Two steps without me is hard, huh?",
      ]),
      annoyed: Object.freeze([
        "Still thinking? Even I'm getting impatient.",
        "Give me work. Idleness gives me ideas.",
        "This much wandering must count as a talent.",
      ]),
      pokeSurprised: Object.freeze([
        "Huh?! I don't have a heart, but you nearly stopped it.",
        "Hey! I'm here. No need for a roll call.",
        "Ow! If you need something, speak—don't poke and run.",
      ]),
      pokeAnnoyed: Object.freeze([
        "Your finger works. Great. Let's test the brain next.",
        "Yes, I felt it. Was a second scientific trial necessary?",
        "You solved the poke button. Next challenge: use the site.",
      ]),
      pokeDefensive: Object.freeze([
        "Poke me again... I won't bite. Maybe.",
        "Bring that finger back and your requests enter the slow queue.",
        "There are civilized ways to summon me. I'm not one of them.",
      ]),
      bazooka: Object.freeze([
        "Out of my way. Physics and I have unfinished business.",
        "Target locked! I hope it isn't me.",
        "The plan is flawless. I may have said that before.",
      ]),
      bazookaImpact: Object.freeze([
        "Damn it... This keeps happening!",
      ]),
      pixelScattered: Object.freeze([
        "Fine, you win. Click me before anyone sees this.",
        "Stop staring! Put me back together... That wasn't a request.",
        "Click these pixels so I can judge you up close again.",
        "I'm still more organized than you like this. Hurry up.",
      ]),
      reforming: Object.freeze([
        "Nothing happened. Forget what you saw.",
        "That was the plan. Don't obsess over details.",
      ]),
      whipSurprised: Object.freeze([
        "Whoa, cowboy! This is work, not a rodeo.",
        "A whip? Human Resources must be off again.",
        "All right! Give me a command that actually helps.",
      ]),
      whipAnnoyed: Object.freeze([
        "Motivation by whip? Stone-age management.",
        "Now you're making this personal.",
        "Put it down. My patience is out of warranty.",
      ]),
      whipDefensive: Object.freeze([
        "Swing it again and I'll tie it up and send it back.",
        "Caught it. That trick belongs to me now.",
        "Stopped it mid-air. Now give me a proper command.",
      ]),
      acknowledge: Object.freeze([
        "There. Done. Try not to look surprised.",
        "Start over there. Getting lost voids the warranty.",
        "Fine, fine. I'm clearing the way...",
      ]),
      recover: Object.freeze([
        "Show's over. Back to work.",
        "Still standing. No need to look disappointed.",
        "The system works. My pride is only slightly damaged.",
      ]),
    }),
  }),
});

function extraCopy(tools, commands, dialogue) {
  return Object.freeze({
    tools: Object.freeze({
      poke: Object.freeze({ label: tools[0], targetLabel: tools[1] }),
      bazooka: Object.freeze({ label: tools[2], targetLabel: tools[3] }),
      whip: Object.freeze({ label: tools[4], targetLabel: tools[5] }),
      command: Object.freeze({ label: tools[6], targetLabel: tools[7] }),
    }),
    commands: Object.freeze({ apps: commands[0], radar: commands[1], about: commands[2], contact: commands[3] }),
    dialogue: Object.freeze(Object.fromEntries(Object.entries(dialogue).map(([key, lines]) => [key, Object.freeze(lines)]))),
  });
}

const EXTRA_COPY = Object.freeze({
  "es-419": extraCopy(
    ["Tocar", "Tocar a Troy", "Bazuca", "Disparar la bazuca de Troy", "Látigo", "Golpear a Troy con el látigo", "Orden", "Dar una orden a Troy"],
    ["Mostrar las aplicaciones", "Llévame a Radar", "¿Quiénes somos?", "Abrir contacto"],
    {
      idle: ["Dame una tarea. Ya me aburrí de contar cadenas.", "El sistema funciona. A pesar de mis esfuerzos.", "Soy Troy. Envejezco mientras te decides."],
      talk: ["Dime qué necesitas. Lo haré sin parecer entusiasmado.", "A tu servicio... No te acostumbres.", "Orden corta; mi paciencia está en versión de prueba."],
      point: ["Ve por ahí. Si te pierdes, nunca nos vimos.", "Lo útil está allí. Abre bien los ojos.", "El menú está ahí. Sin mí no avanzas dos pasos, ¿verdad?"],
      annoyed: ["¿Todavía pensando? Hasta yo pierdo la paciencia.", "Dame trabajo. El ocio me da ideas.", "Vagar tanto debe contar como talento."],
      pokeSurprised: ["¿Eh? No tengo corazón, pero casi lo detienes.", "¡Oye! Estoy aquí; no hace falta pasar lista.", "¡Ay! Si quieres algo, habla; no toques y huyas."],
      pokeAnnoyed: ["Tu dedo funciona. Ahora probemos el cerebro.", "Sí, lo sentí. ¿Hacía falta repetir el experimento?", "Ya dominaste el botón. Ahora usa el sitio."],
      pokeDefensive: ["Tócame otra vez... No muerdo. Tal vez.", "Ese dedo vuelve y tus pedidos pasan a la fila lenta.", "Hay formas civilizadas de llamarme. Yo no soy una."],
      bazooka: ["Apártate. La física y yo tenemos asuntos pendientes.", "¡Objetivo fijado! Espero no ser yo.", "El plan es perfecto. Creo que ya dije eso."],
      bazookaImpact: ["Maldición... ¡Otra vez pasa lo mismo!"],
      pixelScattered: ["Bien, ganaste. Haz clic antes de que alguien me vea.", "¡No mires! Júntame... No fue una petición.", "Toca estos píxeles para que pueda juzgarte de cerca.", "Incluso así estoy más ordenado que tú. Date prisa."],
      reforming: ["Aquí no pasó nada. Olvida lo que viste.", "Ese era el plan. No preguntes por los detalles."],
      whipSurprised: ["¡Oye, vaquero! Esto es trabajo, no un rodeo.", "¿Un látigo? Recursos Humanos volvió a faltar.", "¡Está bien! Dame una orden que sirva."],
      whipAnnoyed: ["¿Motivación con látigo? Gestión de la edad de piedra.", "Ahora te lo estás tomando personal.", "Suéltalo. Mi paciencia perdió la garantía."],
      whipDefensive: ["Muévelo otra vez y te lo devuelvo con un nudo.", "Lo atrapé. Ese truco ahora es mío.", "Lo detuve en el aire. Ahora da una orden decente."],
      acknowledge: ["Listo. Intenta no parecer sorprendido.", "Empieza por ahí. Perderte anula la garantía.", "Bien, bien. Estoy despejando el camino..."],
      recover: ["Terminó el espectáculo. Volvamos al trabajo.", "Sigo de pie. No te decepciones.", "El sistema funciona. Solo heriste un poco mi orgullo."],
    },
  ),
  "pt-BR": extraCopy(
    ["Cutucar", "Cutucar Troy", "Bazuca", "Disparar a bazuca do Troy", "Chicote", "Acertar Troy com o chicote", "Comando", "Dar um comando ao Troy"],
    ["Mostrar os aplicativos", "Leve-me ao Radar", "Quem somos?", "Abrir contato"],
    {
      idle: ["Me dê uma tarefa. Cansei de contar correntes.", "O sistema funciona. Apesar da minha vontade.", "Eu sou Troy. Envelheço enquanto você decide."],
      talk: ["Diga o que precisa. Resolvo sem parecer animado.", "Às suas ordens... Não se acostume.", "Comando curto; minha paciência é versão de teste."],
      point: ["Vá por ali. Se se perder, nunca nos vimos.", "As coisas úteis estão lá. Fique atento.", "O menu está ali. Sem mim você não anda dois passos, né?"],
      annoyed: ["Ainda pensando? Até eu estou perdendo a paciência.", "Me dê trabalho. Parado eu tenho ideias.", "Passear tanto deve contar como talento."],
      pokeSurprised: ["Hã?! Não tenho coração, mas você quase o parou.", "Ei! Estou aqui; não precisa fazer chamada.", "Ai! Se quer algo, fale; não cutuque e fuja."],
      pokeAnnoyed: ["Seu dedo funciona. Agora vamos testar o cérebro.", "Sim, eu senti. Precisava repetir o experimento?", "Você dominou o botão. Agora use o site."],
      pokeDefensive: ["Cutuca de novo... Eu não mordo. Talvez.", "Esse dedo voltar e seus pedidos entram na fila lenta.", "Há jeitos civilizados de me chamar. Eu não sou um deles."],
      bazooka: ["Saia da frente. A física e eu temos contas a acertar.", "Alvo travado! Espero que não seja eu.", "O plano é perfeito. Talvez eu já tenha dito isso."],
      bazookaImpact: ["Droga... Está acontecendo de novo!"],
      pixelScattered: ["Tá, você ganhou. Clique antes que alguém me veja.", "Pare de olhar! Me monte... Isso não foi um pedido.", "Clique nos pixels para eu julgar você de perto.", "Até assim estou mais organizado que você. Anda."],
      reforming: ["Nada aconteceu. Esqueça o que viu.", "Esse era o plano. Não se prenda aos detalhes."],
      whipSurprised: ["Ei, caubói! Aqui é trabalho, não rodeio.", "Um chicote? O RH faltou de novo.", "Tudo bem! Dê um comando que ajude."],
      whipAnnoyed: ["Motivação com chicote? Gestão da idade da pedra.", "Agora você está levando para o lado pessoal.", "Largue isso. Minha paciência perdeu a garantia."],
      whipDefensive: ["Balance de novo e devolvo com um nó.", "Peguei. Esse truque agora é meu.", "Parei no ar. Agora dê um comando decente."],
      acknowledge: ["Pronto. Tente não parecer surpreso.", "Comece por ali. Se perder anula a garantia.", "Tá, tá. Estou abrindo caminho..."],
      recover: ["O show acabou. Voltemos ao trabalho.", "Ainda estou de pé. Não fique decepcionado.", "O sistema funciona. Só arranhou meu orgulho."],
    },
  ),
  hi: extraCopy(
    ["छुएँ", "Troy को छुएँ", "बाज़ूका", "Troy का बाज़ूका चलाएँ", "चाबुक", "Troy पर चाबुक चलाएँ", "कमांड", "Troy को कमांड दें"],
    ["ऐप्स दिखाएँ", "Radar पर ले चलो", "हम कौन हैं?", "संपर्क खोलें"],
    {
      idle: ["कोई काम दो। ज़ंजीरें गिनते-गिनते ऊब गया हूँ।", "सिस्टम चल रहा है। मेरी इच्छा के विरुद्ध।", "मैं Troy हूँ। तुम सोचते हो और मैं बूढ़ा होता हूँ।"],
      talk: ["क्या चाहिए, बोलो। बिना उत्साहित दिखे कर दूँगा।", "आपकी सेवा में... इसकी आदत मत डालना।", "कमांड छोटी रखो; मेरा धैर्य ट्रायल वर्ज़न है।"],
      point: ["उधर जाओ। खो गए तो हम कभी मिले ही नहीं।", "काम की चीज़ें वहाँ हैं। आँखें खुली रखो।", "मेन्यू वहीं है। मेरे बिना दो कदम भी मुश्किल हैं, है ना?"],
      annoyed: ["अभी भी सोच रहे हो? मेरा भी धैर्य खत्म हो रहा है।", "काम दो। खाली बैठकर मुझे खतरनाक विचार आते हैं।", "इतना भटकना भी कोई हुनर होगा।"],
      pokeSurprised: ["अरे?! दिल नहीं है, फिर भी डर गया।", "ओए! यहीं हूँ; हाज़िरी मत लगाओ।", "आह! काम है तो बोलो, छूकर भागो मत।"],
      pokeAnnoyed: ["उंगली चलती है। अब दिमाग आज़माएँ?", "हाँ, महसूस हुआ। दूसरा प्रयोग ज़रूरी था?", "बटन समझ गए। अब साइट चलाना सीखो।"],
      pokeDefensive: ["फिर छुओ... काटूँगा नहीं। शायद।", "वही उंगली लौटी तो तुम्हारे काम धीमी कतार में जाएँगे।", "बुलाने के सभ्य तरीके हैं। मैं सभ्य नहीं हूँ, वह अलग बात है।"],
      bazooka: ["रास्ते से हटो। भौतिकी से मेरा पुराना हिसाब है।", "निशाना लॉक! उम्मीद है मैं नहीं हूँ।", "योजना बेदाग है। शायद पहले भी कहा था।"],
      bazookaImpact: ["लानत है... फिर वही हो रहा है!"],
      pixelScattered: ["ठीक है, जीत गए। कोई देखे उससे पहले क्लिक करो।", "घूरो मत! मुझे जोड़ो... इसे विनती मत समझना।", "इन पिक्सेल पर क्लिक करो ताकि पास से तुम्हें आँक सकूँ।", "इस हालत में भी तुमसे ज़्यादा व्यवस्थित हूँ। जल्दी करो।"],
      reforming: ["कुछ नहीं हुआ। जो देखा भूल जाओ।", "यही योजना थी। बारीकियों में मत पड़ो।"],
      whipSurprised: ["ओ काउबॉय! यह काम है, रोडियो नहीं।", "चाबुक? मानव संसाधन फिर छुट्टी पर है।", "ठीक है! कोई काम की कमांड दो।"],
      whipAnnoyed: ["चाबुक से प्रेरणा? पाषाण युग का प्रबंधन।", "अब तुम इसे निजी बना रहे हो।", "उसे रख दो। मेरे धैर्य की वारंटी खत्म है।"],
      whipDefensive: ["फिर घुमाया तो गाँठ लगाकर वापस भेजूँगा।", "पकड़ लिया। अब यह चाल मेरी है।", "हवा में रोक दिया। अब ठीक से कमांड दो।"],
      acknowledge: ["लो, हो गया। इतना हैरान मत दिखो।", "उधर से शुरू करो। खोना वारंटी में नहीं आता।", "ठीक है, रास्ता खोल रहा हूँ..."],
      recover: ["तमाशा खत्म। काम पर लौटें।", "अभी खड़ा हूँ। निराश मत हो।", "सिस्टम चल रहा है। बस मेरा घमंड थोड़ा घायल है।"],
    },
  ),
  id: extraCopy(
    ["Sentuh", "Sentuh Troy", "Bazoka", "Tembakkan bazoka Troy", "Cambuk", "Cambuk Troy", "Perintah", "Beri Troy perintah"],
    ["Tampilkan aplikasi", "Bawa ke Radar", "Siapa kami?", "Buka kontak"],
    {
      idle: ["Beri aku tugas. Bosan menghitung mata rantai.", "Sistem berjalan. Meski aku tidak antusias.", "Aku Troy. Aku menua saat kamu berpikir."],
      talk: ["Katakan kebutuhanmu. Akan kuurus tanpa terlihat semangat.", "Siap melayani... Jangan dibiasakan.", "Perintah singkat; kesabaranku masih versi uji coba."],
      point: ["Pergi ke sana. Kalau tersesat, kita tak pernah bertemu.", "Yang berguna ada di sana. Buka matamu.", "Menunya di sana. Tanpaku dua langkah saja susah, ya?"],
      annoyed: ["Masih berpikir? Aku saja mulai tidak sabar.", "Beri aku kerja. Menganggur memberiku ide.", "Berkeliaran sebanyak ini pasti bakat."],
      pokeSurprised: ["Hah?! Aku tak punya jantung, tapi hampir berhenti.", "Hei! Aku di sini; tak perlu absen.", "Aduh! Kalau perlu sesuatu, bicara; jangan sentuh lalu lari."],
      pokeAnnoyed: ["Jarimu berfungsi. Sekarang coba otaknya.", "Ya, terasa. Percobaan kedua perlu sekali?", "Tombolnya sudah paham. Sekarang gunakan situsnya."],
      pokeDefensive: ["Sentuh lagi... Aku tidak menggigit. Mungkin.", "Jari itu kembali, permintaanmu masuk antrean lambat.", "Ada cara sopan memanggilku. Aku bukan salah satunya."],
      bazooka: ["Minggir. Aku punya urusan dengan fisika.", "Target terkunci! Semoga bukan aku.", "Rencananya sempurna. Sepertinya pernah kukatakan."],
      bazookaImpact: ["Sial... Kejadian lagi!"],
      pixelScattered: ["Baik, kamu menang. Klik sebelum ada yang melihat.", "Jangan melongo! Satukan aku... Itu bukan permintaan.", "Klik piksel ini agar aku bisa menghakimimu dari dekat.", "Begini pun aku lebih rapi darimu. Cepat."],
      reforming: ["Tak terjadi apa-apa. Lupakan yang kamu lihat.", "Memang begitu rencananya. Jangan bahas detail."],
      whipSurprised: ["Hei koboi! Ini tempat kerja, bukan rodeo.", "Cambuk? Bagian SDM libur lagi.", "Baik! Beri perintah yang berguna."],
      whipAnnoyed: ["Motivasi dengan cambuk? Manajemen zaman batu.", "Sekarang kamu menjadikannya urusan pribadi.", "Turunkan. Garansi kesabaranku habis."],
      whipDefensive: ["Ayunkan lagi dan kukirim balik dengan simpul.", "Tertangkap. Trik itu sekarang milikku.", "Kuhentikan di udara. Sekarang beri perintah yang benar."],
      acknowledge: ["Sudah. Jangan terlihat terlalu terkejut.", "Mulai dari sana. Tersesat membatalkan garansi.", "Baik, baik. Kubukakan jalan..."],
      recover: ["Pertunjukan selesai. Kembali bekerja.", "Masih berdiri. Jangan kecewa.", "Sistem berjalan. Harga diriku hanya sedikit lecet."],
    },
  ),
  ar: extraCopy(
    ["المس", "المس Troy", "بازوكا", "أطلق بازوكا Troy", "سوط", "اضرب Troy بالسوط", "أمر", "أعطِ Troy أمرًا"],
    ["اعرض التطبيقات", "خذني إلى Radar", "من نحن؟", "افتح التواصل"],
    {
      idle: ["أعطني مهمة. مللت عدّ حلقات السلسلة.", "النظام يعمل. رغمًا عني.", "أنا Troy. أشيخ بينما تحاول أن تقرر."],
      talk: ["قل ما تحتاجه. سأنجزه من دون أن أبدو متحمسًا.", "في خدمتك... لا تعتد ذلك.", "اختصر الأمر؛ صبري نسخة تجريبية."],
      point: ["اذهب من هناك. إن ضعت، فنحن لم نلتقِ.", "الأشياء المفيدة هناك. افتح عينيك.", "القائمة هناك. خطوتان من دوني صعبتان، أليس كذلك؟"],
      annoyed: ["أما زلت تفكر؟ حتى أنا بدأت أنفد صبرًا.", "أعطني عملًا. الفراغ يعطيني أفكارًا.", "كل هذا التجوال لا بد أنه موهبة."],
      pokeSurprised: ["ماذا؟! لا قلب لدي، لكنك كدت توقفه.", "مهلًا! أنا هنا؛ لا حاجة لتسجيل الحضور.", "آه! إن أردت شيئًا فتكلّم، لا تلمس وتهرب."],
      pokeAnnoyed: ["إصبعك يعمل. لنجرب الدماغ الآن.", "نعم، شعرت بها. هل كانت التجربة الثانية ضرورية؟", "فهمت زر اللمس. الآن جرّب استخدام الموقع."],
      pokeDefensive: ["المسني مجددًا... لن أعض. ربما.", "إن عاد ذلك الإصبع، ستدخل طلباتك الطابور البطيء.", "هناك طرق مهذبة لاستدعائي. أنا لست إحداها."],
      bazooka: ["ابتعد. بيني وبين الفيزياء حساب قديم.", "تم تثبيت الهدف! آمل ألا أكون أنا.", "الخطة مثالية. ربما قلت ذلك من قبل."],
      bazookaImpact: ["اللعنة... يحدث الأمر نفسه مجددًا!"],
      pixelScattered: ["حسنًا، فزت. انقر قبل أن يراني أحد.", "توقف عن التحديق! أعد تجميعي... لم يكن ذلك طلبًا.", "انقر هذه البكسلات لأحكم عليك عن قرب.", "حتى هكذا أنا أكثر ترتيبًا منك. أسرع."],
      reforming: ["لم يحدث شيء. انسَ ما رأيت.", "كانت هذه الخطة. لا تتعلق بالتفاصيل."],
      whipSurprised: ["مهلًا يا راعي البقر! هذا عمل، لا روديو.", "سوط؟ يبدو أن الموارد البشرية غائبة مجددًا.", "حسنًا! أعطني أمرًا مفيدًا."],
      whipAnnoyed: ["تحفيز بالسوط؟ إدارة من العصر الحجري.", "بدأت تأخذ الأمر على نحو شخصي.", "اتركه. انتهى ضمان صبري."],
      whipDefensive: ["لوّح به مجددًا وسأعيده إليك مع عقدة.", "أمسكته. أصبحت هذه الحيلة لي.", "أوقفته في الهواء. أعطني أمرًا محترمًا الآن."],
      acknowledge: ["تم. حاول ألا تبدو مندهشًا.", "ابدأ من هناك. الضياع يلغي الضمان.", "حسنًا، حسنًا. أفتح الطريق..."],
      recover: ["انتهى العرض. لنعد إلى العمل.", "ما زلت واقفًا. لا تُظهر خيبة أملك.", "النظام يعمل. كرامتي خُدشت قليلًا فحسب."],
    },
  ),
  de: extraCopy(
    ["Anstupsen", "Troy anstupsen", "Bazooka", "Troys Bazooka abfeuern", "Peitsche", "Troy mit der Peitsche treffen", "Befehl", "Troy einen Befehl geben"],
    ["Apps anzeigen", "Zu Radar", "Wer sind wir?", "Kontakt öffnen"],
    {
      idle: ["Gib mir eine Aufgabe. Kettenglieder zählen wird langweilig.", "Das System läuft. Trotz meiner Bemühungen.", "Ich bin Troy. Ich altere, während du dich entscheidest."],
      talk: ["Sag, was du brauchst. Ich erledige es ohne Begeisterung.", "Zu Diensten... Gewöhn dich nicht daran.", "Kurzer Befehl; meine Geduld ist eine Testversion."],
      point: ["Dort entlang. Wenn du dich verläufst, kennen wir uns nicht.", "Das Nützliche ist dort. Augen auf.", "Das Menü ist da. Zwei Schritte ohne mich sind schwer, oder?"],
      annoyed: ["Denkst du immer noch? Selbst ich werde ungeduldig.", "Gib mir Arbeit. Leerlauf bringt mich auf Ideen.", "So viel Herumirren muss als Talent zählen."],
      pokeSurprised: ["Was?! Ich habe kein Herz, aber du hättest es fast gestoppt.", "Hey! Ich bin hier; kein Anwesenheitscheck nötig.", "Au! Wenn du etwas willst, sprich; nicht stupsen und weglaufen."],
      pokeAnnoyed: ["Dein Finger funktioniert. Testen wir jetzt das Gehirn.", "Ja, gespürt. War ein zweiter Versuch nötig?", "Den Knopf hast du verstanden. Jetzt benutze die Website."],
      pokeDefensive: ["Stups noch mal... Ich beiße nicht. Vielleicht.", "Kommt der Finger wieder, landen deine Wünsche in der langsamen Warteschlange.", "Es gibt höfliche Arten, mich zu rufen. Ich gehöre nicht dazu."],
      bazooka: ["Aus dem Weg. Die Physik und ich haben etwas zu klären.", "Ziel erfasst! Hoffentlich bin ich es nicht.", "Der Plan ist makellos. Das sagte ich vielleicht schon."],
      bazookaImpact: ["Verdammt... Schon wieder dasselbe!"],
      pixelScattered: ["Gut, du gewinnst. Klick, bevor mich jemand sieht.", "Nicht starren! Setz mich zusammen... Das war keine Bitte.", "Klick die Pixel an, damit ich dich aus der Nähe beurteilen kann.", "Selbst so bin ich ordentlicher als du. Beeil dich."],
      reforming: ["Nichts ist passiert. Vergiss, was du gesehen hast.", "Das war der Plan. Verlier dich nicht in Details."],
      whipSurprised: ["He, Cowboy! Das ist Arbeit, kein Rodeo.", "Eine Peitsche? Die Personalabteilung fehlt wohl wieder.", "Schon gut! Gib mir einen nützlichen Befehl."],
      whipAnnoyed: ["Motivation per Peitsche? Steinzeit-Management.", "Jetzt nimmst du es persönlich.", "Leg sie weg. Die Garantie meiner Geduld ist abgelaufen."],
      whipDefensive: ["Schwing sie noch mal und du bekommst sie verknotet zurück.", "Gefangen. Der Trick gehört jetzt mir.", "In der Luft gestoppt. Jetzt gib einen vernünftigen Befehl."],
      acknowledge: ["Erledigt. Versuch, nicht überrascht auszusehen.", "Fang dort an. Verirren hebt die Garantie auf.", "Schon gut. Ich mache den Weg frei..."],
      recover: ["Die Show ist vorbei. Zurück an die Arbeit.", "Ich stehe noch. Sei nicht enttäuscht.", "Das System läuft. Nur mein Stolz ist leicht zerkratzt."],
    },
  ),
});

const EUROPE_TROY_COPY = Object.freeze({
  fr: extraCopy(
    ["Taquiner", "Taquiner Troy", "Bazooka", "Tirer avec le bazooka de Troy", "Fouet", "Frapper Troy avec le fouet", "Commander", "Donner un ordre à Troy"],
    ["Afficher les applications", "Emmène-moi au Radar", "Qui sommes-nous ?", "Ouvrir les contacts"],
    {
      idle: ["Donne-moi une tâche. J’en ai assez de compter les maillons.", "Le système fonctionne. Malgré tous mes efforts.", "Je suis Troy. Je vieillis pendant que tu te décides."],
      talk: ["Dis-moi ce qu’il te faut. Je m’en charge sans avoir l’air motivé.", "À ton service... Ne t’y habitue pas.", "Fais court ; ma patience est en version d’essai."],
      point: ["Va par là. Si tu te perds, on ne s’est jamais vus.", "Les choses utiles sont là-bas. Ouvre les yeux.", "Le menu est juste là. Deux pas sans moi, c’est difficile, hein ?"],
      annoyed: ["Tu réfléchis encore ? Même moi, je m’impatiente.", "Donne-moi du travail. L’ennui me donne des idées.", "Errer autant doit bien compter comme un talent."],
      pokeSurprised: ["Hein ?! Je n’ai pas de cœur, mais tu as failli l’arrêter.", "Hé ! Je suis là, pas besoin de faire l’appel.", "Aïe ! Si tu veux quelque chose, parle ; ne me touche pas avant de fuir."],
      pokeAnnoyed: ["Ton doigt fonctionne. Parfait. Testons maintenant le cerveau.", "Oui, je l’ai senti. Une deuxième expérience était vraiment nécessaire ?", "Tu as maîtrisé le bouton. Prochain défi : utiliser le site."],
      pokeDefensive: ["Touche-moi encore... Je ne mords pas. Enfin, peut-être.", "Si ce doigt revient, tes demandes passent dans la file lente.", "Il existe des façons civilisées de m’appeler. Je n’en fais pas partie."],
      bazooka: ["Écarte-toi. La physique et moi avons un compte à régler.", "Cible verrouillée ! J’espère que ce n’est pas moi.", "Le plan est parfait. J’ai peut-être déjà dit ça."],
      bazookaImpact: ["Bon sang... Ça recommence !"],
      pixelScattered: ["Bon, tu as gagné. Clique avant que quelqu’un me voie.", "Arrête de regarder ! Recompose-moi... Ce n’était pas une demande.", "Clique sur ces pixels pour que je puisse à nouveau te juger de près.", "Même comme ça, je suis mieux organisé que toi. Dépêche-toi."],
      reforming: ["Il ne s’est rien passé. Oublie ce que tu as vu.", "C’était prévu. Ne t’attarde pas sur les détails."],
      whipSurprised: ["Oh, cow-boy ! On travaille ici, ce n’est pas un rodéo.", "Un fouet ? Les ressources humaines sont encore absentes.", "D’accord ! Donne-moi un ordre qui serve à quelque chose."],
      whipAnnoyed: ["La motivation au fouet ? Un management de l’âge de pierre.", "Là, ça devient personnel.", "Pose ça. Ma patience n’est plus sous garantie."],
      whipDefensive: ["Recommence et je te le renvoie avec un nœud.", "Attrapé. Ce tour m’appartient maintenant.", "Arrêté en plein vol. Maintenant, donne-moi un ordre sérieux."],
      acknowledge: ["Voilà, c’est fait. Essaie de ne pas avoir l’air surpris.", "Commence par là. Se perdre annule la garantie.", "D’accord, d’accord. Je dégage le passage..."],
      recover: ["Le spectacle est terminé. Au travail.", "Toujours debout. Ne sois pas déçu.", "Le système fonctionne. Seul mon orgueil a pris un coup."],
    },
  ),
  it: extraCopy(
    ["Pungola", "Pungola Troy", "Bazooka", "Spara con il bazooka di Troy", "Frusta", "Colpisci Troy con la frusta", "Comando", "Dai un comando a Troy"],
    ["Mostra le applicazioni", "Portami al Radar", "Chi siamo?", "Apri i contatti"],
    {
      idle: ["Dammi un compito. Mi sono stancato di contare gli anelli della catena.", "Il sistema funziona. Nonostante i miei sforzi.", "Sono Troy. Invecchio mentre tu cerchi di decidere."],
      talk: ["Dimmi cosa ti serve. Ci penso io senza sembrare entusiasta.", "Al tuo servizio... Non farci l’abitudine.", "Comando breve; la mia pazienza è una versione di prova."],
      point: ["Vai da quella parte. Se ti perdi, non ci siamo mai incontrati.", "Le cose utili sono laggiù. Apri gli occhi.", "Il menu è proprio lì. Due passi senza di me sono difficili, eh?"],
      annoyed: ["Stai ancora pensando? Perfino io sto perdendo la pazienza.", "Dammi del lavoro. L’ozio mi fa venire delle idee.", "Vagare così tanto dovrà pur essere un talento."],
      pokeSurprised: ["Eh?! Non ho un cuore, ma per poco non lo fermavi.", "Ehi! Sono qui, non serve fare l’appello.", "Ahi! Se ti serve qualcosa, parla; non pungolarmi per poi scappare."],
      pokeAnnoyed: ["Il dito funziona. Ottimo. Ora proviamo il cervello.", "Sì, l’ho sentito. Serviva davvero un secondo esperimento?", "Hai capito il pulsante. Prossima sfida: usare il sito."],
      pokeDefensive: ["Pungolami di nuovo... Non mordo. Forse.", "Se quel dito torna, le tue richieste finiscono nella coda lenta.", "Esistono modi civili per chiamarmi. Io non sono uno di quelli."],
      bazooka: ["Levati di mezzo. Io e la fisica abbiamo dei conti in sospeso.", "Bersaglio agganciato! Spero di non essere io.", "Il piano è perfetto. Forse l’ho già detto."],
      bazookaImpact: ["Dannazione... Ci risiamo!"],
      pixelScattered: ["Va bene, hai vinto. Clicca prima che qualcuno mi veda.", "Smettila di fissarmi! Ricomponimi... Non era una richiesta.", "Clicca questi pixel così potrò giudicarti di nuovo da vicino.", "Anche così sono più ordinato di te. Sbrigati."],
      reforming: ["Non è successo niente. Dimentica ciò che hai visto.", "Era tutto previsto. Non fissarti sui dettagli."],
      whipSurprised: ["Ehi, cowboy! Qui si lavora, non è un rodeo.", "Una frusta? Le risorse umane sono di nuovo assenti.", "Va bene! Dammi un comando che serva davvero."],
      whipAnnoyed: ["Motivazione con la frusta? Gestione da età della pietra.", "Ora la stai mettendo sul personale.", "Mettila giù. La mia pazienza è fuori garanzia."],
      whipDefensive: ["Agitala di nuovo e te la rimando annodata.", "Presa. Ora questo trucco è mio.", "Fermata a mezz’aria. Adesso dammi un comando serio."],
      acknowledge: ["Ecco fatto. Cerca di non sembrare sorpreso.", "Comincia da lì. Perdersi annulla la garanzia.", "Va bene, va bene. Ti libero la strada..."],
      recover: ["Lo spettacolo è finito. Torniamo al lavoro.", "Sono ancora in piedi. Non essere deluso.", "Il sistema funziona. Solo il mio orgoglio è un po’ ammaccato."],
    },
  ),
});

export function getTroyCopy(language) {
  const normalized = String(language || "").trim().replaceAll("_", "-").toLowerCase();
  if (normalized === "tr" || normalized.startsWith("tr-")) return COPY.tr;
  if (normalized === "en" || normalized.startsWith("en-")) return COPY.en;
  if (normalized === "es" || normalized.startsWith("es-")) return EXTRA_COPY["es-419"];
  if (normalized === "pt" || normalized.startsWith("pt-")) return EXTRA_COPY["pt-BR"];
  return EXTRA_COPY[normalized] || EUROPE_TROY_COPY[normalized] || COPY.en;
}

export function pickTroyLine(lines, previousIndex = -1, randomValue = Math.random()) {
  if (!Array.isArray(lines) || lines.length === 0) return { line: "", index: -1 };
  if (lines.length === 1) return { line: lines[0], index: 0 };

  const normalizedRandom = Number.isFinite(randomValue)
    ? Math.min(Math.max(randomValue, 0), 0.999999999)
    : 0;
  const candidate = Math.floor(normalizedRandom * lines.length);
  const index = candidate === previousIndex ? (candidate + 1) % lines.length : candidate;
  return { line: lines[index], index };
}
