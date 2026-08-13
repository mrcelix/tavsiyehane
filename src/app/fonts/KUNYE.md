# Font künyesi

Bu klasördeki `.woff2` dosyaları **SIL Open Font License 1.1** ile lisanslı üç
aileden alınmıştır. Üçü de serbestçe yeniden dağıtılabilir; koşul, künyenin
korunması ve dosyaların kendi başına satılmamasıdır.

| Dosya | Aile | Telif | Lisans |
| --- | --- | --- | --- |
| `inter-latin.woff2`, `inter-latin-ext.woff2` | Inter | Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter) | OFL 1.1 |
| `nunito-latin.woff2`, `nunito-latin-ext.woff2` | Nunito | Copyright 2014 The Nunito Project Authors (https://github.com/googlefonts/nunito) | OFL 1.1 |
| `jetbrains-mono-latin.woff2`, `jetbrains-mono-latin-ext.woff2` | JetBrains Mono | Copyright 2020 The JetBrains Mono Project Authors (https://github.com/JetBrains/JetBrainsMono) | OFL 1.1 |

Lisans metni: https://openfontlicense.org

## Neden depoda duruyorlar

`next/font/google` fontları **derleme anında** Google'dan indiriyordu. Google
dosya adreslerini döndürdüğü gün derleme kırıldı: Vercel geri yüklediği derleme
önbelleğindeki eski adresleri istedi ve 404 aldı. Dosyalar depoda olunca
derlemenin ağ bağımlılığı kalmıyor.

## Nasıl üretildiler

Google Fonts CSS API'sinden, **değişken (variable)** sürümlerin `latin` ve
`latin-ext` alt kümeleri indirildi. Aile başına iki dosya olmasının sebebi
Türkçe: `ğ ş İ` latin-ext alt kümesinde, `ı` ve ASCII latin'de; tek dosya
ikisini birden vermiyor. Her dosya `layout.tsx` içinde kendi `unicode-range`i
ile tanımlı.

Yenilemek gerekirse (ör. yeni bir ağırlık aralığı için) aynı yol izlenebilir:
`https://fonts.googleapis.com/css2?family=<Aile>:wght@<min>..<maks>&display=swap`
adresini modern bir tarayıcı `User-Agent`'ı ile çekip `latin` ve `latin-ext`
bloklarındaki `.woff2` adreslerini indirmek yeterli.
