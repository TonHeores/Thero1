import sys;
import os
import os.path


def addJsExt(root,fileName,filePath):
   # print(filePath)
    fpPath2 = filePath.replace("/out/","/exe/")
   # print("####:"+fpPath2)
    fp2 = open(fpPath2, 'w')

    with open(filePath, 'r') as fp1:
        line = fp1.readline()
        while line:
            # 处理每一行数据
            #print(line)
            if(line.find("import ")==0 and line.find("json\";")<0):
                #print(line)
                line = line.replace("\";",".js\";")
                #print(line)
            if(line.find("export {}")>=0):
                print("@@@@@@@@@@@@@@@@@")
                print(line)
                line=""

            if(line!=""):
                fp2.write(line)

            line = fp1.readline()
    fp1.close()
    fp2.close()



def hello(path):
    for root, dirs, files in os.walk(path):
        print ("root:",root,"dirs:",dirs,"files:",files )

        for file in files:
            #print(dirs)
            file_path = os.path.join(root, file)
            # 进行操作，例如打印文件路径
            addJsExt(".",file,file_path)


hello("./out/")
#addJsExt(".","t.js","t.js")

