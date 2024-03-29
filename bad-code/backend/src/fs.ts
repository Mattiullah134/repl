import { S3 } from "aws-sdk";
import fs from "fs";

interface File {
  type: "file" | "dir";
  name: string;
}

export const fetchDir = (dir: string, baseDir: string): Promise<File[]> => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, { withFileTypes: true }, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(
          files.map((file) => ({
            type: file.isDirectory() ? "dir" : "file",
            name: file.name,
            path: `${baseDir}/${file.name}`,
          }))
        );
      }
    });
  });
};

export const fetchFileContent = (file: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

export const saveFile = async (
  filePath: string,
  content: S3.Body,
  index?: number,
  type?: string
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    if (index) {
      const file = await fetchFileContent(filePath);
      if (file) {
        const fileDataInarray = file.split("\n");
        const data = content.toString();
        if (type === "insert") {
          fileDataInarray.splice(index, 0, data);
        } else if (type === "update") {
          fileDataInarray[index] = data;
        } else if (type === "delete") {
          fileDataInarray.splice(index, 1);
        } else {
          console.log("type is not supported");
        }
        const newFileData = fileDataInarray.join("\n");
        fs.writeFile(filePath, newFileData, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      }
    } else {
      const body = content.toString();
      fs.writeFile(filePath, body, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }
  });
};
