"""
Doesn't handle POST requests.
"""
import SocketServer
import SimpleHTTPServer

PORT = 61004

_data_file = "/Users/Main/Desktop/bibleorquran_data.txt"

class bcolors:
    """from useful stackoverflow post."""

    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def write_data(correct, verse, ip, text):
    data = open(_data_file, "a")
    data.write("correct="+str(correct) + ",verse="+verse+",ip=" + ip+",text="+text + "\n")
    data.close();


def parse_path(path):
    path = path.replace('/', '')
    parts = path.split(';')
    # Data pieces: text, verse, correct
    try:
        data = {'text': None, 'verse': None, 'correct': None}
        for part in parts:
            kv = part.split('=')
            if kv[0] == "text":
                data['text'] = kv[1]
            elif kv[0] == "verse":
                data['verse'] = kv[1]
            elif kv[0] == "correct":
                data['correct'] = bool(kv[1])
        return data
    except Exception as e:
        print(str(e))


def handle(path, ip):
    # Path format: /id=<id>;time=<seconds>;
    # Response format: id=<id>;total=<total seconds>;personal=<personal contribution>;error=OK

    if path == "/favicon.ico":
        return

    dicti = parse_path(path)  # go python
    verse = dicti['verse']
    text = dicti['text']
    correct = dicti['correct']

    if text != "bible":
        if text != "quran":
            return

    write_data(correct, verse, ip, text)
    if correct:
        print(bcolors.OKBLUE+bcolors.BOLD + ip + ": " + bcolors.OKGREEN + "CORRECT " + bcolors.HEADER + "on [" + bcolors.UNDERLINE + text + ": "+ verse +"]" + bcolors.ENDC)
    else:
        print(bcolors.OKBLUE+bcolors.BOLD + ip + ": " + bcolors.FAIL + "INCORRECT " + bcolors.HEADER + "on [" + bcolors.UNDERLINE + text + ": "+ verse +"]"+ bcolors.ENDC)
    return "610 OK"


class CustomHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(handle(self.path, self.client_address[0]))
        return


httpd = SocketServer.ThreadingTCPServer(('localhost', PORT), CustomHandler)

print "bibleorquran stat server is successfully running on port ", PORT
httpd.serve_forever()
