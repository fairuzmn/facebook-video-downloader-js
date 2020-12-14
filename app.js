const request = require('request');
const fs = require('fs');
const readline = require('readline');

const getUrl = (url) => {
    let options = {
        'method': 'POST',
        'url': 'https://www.getfvid.com/downloader',
        formData: {
            'url': url
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        let namaVideo = "noname " + Math.random(666) + ".mp4"

        let private = response.body.match(/Uh-Oh! This video might be private and not publi/g)
        if (private) {
            console.log('\x1b[31m%s\x1b[0m', `[-] This Video Is Private`)
            return;
        }

        const regexNama = /<p class="card-text">(.*?)<\/p>/g
        let arrNama = [...response.body.matchAll(regexNama)]
        if (arrNama[0] != undefined) {
            namaVideo = arrNama[0][1] + ".mp4"
        }

        const rgx = /<a href="(.+?)" target="_blank" class="btn btn-download"(.+?)>(.+?)<\/a>/g
        let arr = [...response.body.matchAll(rgx)]
        let resAkhir = [];

        arr.map((item, i) => {
            if (i == 0) {
                if (item[3].match('<strong>HD</strong>')) {
                    item[3] = "Download in HD Quality"
                }

                console.log('\x1b[32m%s\x1b[0m', `[+] Result : ${namaVideo}`)
            }
            console.log(
                '\x1b[32m%s\x1b[0m',
                `    [${++i}] ` + item[3]
            );
            resAkhir.push([
                item[3],
                item[1].replace(/amp;/gi, '')
            ])
        })

        if (resAkhir.length > 0) {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            })

            rl.question(`\x1b[32m[+] Select Download : `, (option) => {
                download(namaVideo, resAkhir[option - 1][1]);
                rl.close()
            })
        } else {
            console.log('\x1b[31m%s\x1b[0m', `[-] Invalid Video URL \n`)
        }
    });
}


const download = (name, url) => {
    if (!fs.existsSync('fb video')) {
        fs.mkdirSync('fb video');
    }
    console.log('[+] Downloading File . . .')
    name = name.replace(/[\\/:"*?<>|]/g, '')
    let file = fs.createWriteStream('fb video/' + name);
    return new Promise((resolve, reject) => {
            request({
                    uri: url,
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
                        'Cache-Control': 'max-age=0',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1',
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
                    },
                    gzip: true,
                    rejectUnauthorized: false
                })
                .pipe(file)
                .on('finish', () => {
                    console.log('\x1b[32m%s\x1b[0m', `[+] Download Success : ${name}`);
                    resolve();
                })
                .on('error', (error) => {
                    reject(error);
                })
        })
        .catch(error => {
            console.log(`Something happened: ${error}`);
        });
}

const start = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    console.log('\x1b[32m%s\x1b[0m', '\n================================================\n')
    console.log('\x1b[32m%s\x1b[0m', 'Facebook Video Downloader\n')
    console.log('\x1b[32m%s\x1b[0m', 'Coded by Parasit \n')
    console.log('\x1b[32m%s\x1b[0m', '================================================\n')
    rl.question(`\x1b[32mInput URL : `, (url) => {
        console.log('\x1b[32m%s\x1b[0m', '\n[+] Checking Video URL . . . ')
        getUrl(url);
        rl.close()
    })
}

start()