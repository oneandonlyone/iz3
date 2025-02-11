//#!/usr/bin/env node trying

/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2015, Nicolas Riesco and others as credited in the AUTHORS file
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 */
 
//jp 
var IsZBlack=0;
if(process.argv[0].match(/zblack/))
{
	IsZBlack=1;
}
if(process.argv[1] && process.argv[1] .match(/z3compiler/))
{
	IsZBlack=2;
}


var console = require("console");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

function z3log()//,filename)
{
	var filename="c:\\temp\\z3logkernal.txt";
	var msg=[];
	for(var i=0; i<arguments.length;i++)
	{
		msg.push(arguments[i]);
	}
	msg=msg.join(",");
	//filename=filename||"c:\\temp\\z3logkernal.txt";
	msg="\n"+(new Date())+":"+msg;
	console.log(msg)
	fs.appendFileSync(filename,msg)
}
console.error("IN KERNAL")
z3log("in kernel", "IsZBlack",IsZBlack)
z3log("argv", process.argv)

if(IsZBlack)
{
	z3log("modules", modulepaths)
}


//var Kernel = require("jp-kernel");
var Kernel = require("jp-kernel",true);






z3log("Kernel # ", Kernel);
z3log("----------------");
//z3log("Kernel found: ", !(!Kernel));
z3log("Trying Date: ");


z3log("@", new Date())
z3log("In kernel.js", process.argv.slice(1))
//fs.writeFileSync("c:\\temp\\xlog.txt","HERE I AM")

//z3log("__dirname detected now is1:", __dirname)

// Parse command arguments
var config = parseCommandArguments();

z3log("config", config)
//z3log("__dirname detected now is2:", __dirname)
//z3log("require.paths:", require.paths)
z3log("require module paths:", modulepaths)

// Setup logging helpers
var log;
var dontLog = function dontLog() {};
var doLog = function doLog() {
    process.stderr.write("KERNEL: ");
    console.error.apply(this, arguments);
};

if (process.env.DEBUG) {
    global.DEBUG = true;

    try {
        doLog = require("debug")("KERNEL:");
    } catch (err) {}
}

log = global.DEBUG ? doLog : dontLog;


// Start kernel
var kernel = new Kernel(config);

// WORKAROUND: Fixes https://github.com/n-riesco/iz3/issues/97
kernel.handlers.is_complete_request = function is_complete_request(request) {
    request.respond(this.iopubSocket, "status", {
        execution_state: "busy"
    });

    var content;
    try {
		console.error("request to eval :",request.content.code)
        new vm.Script(request.content.code);
        content = {
            status: "complete",
        };
    } catch (err) {
        content = {
            status: "incomplete",
            indent: "",
        };
    }

    request.respond(
        this.shellSocket,
        "is_complete_reply",
        content,
        {},
        this.protocolVersion
    );

    request.respond(this.iopubSocket, "status", {
        execution_state: "idle"
    });
};

// Interpret a SIGINT signal as a request to interrupt the kernel
process.on("SIGINT", function() {
    log("Interrupting kernel");
    kernel.restart(); // TODO(NR) Implement kernel interruption
});


/**
 * Parse command arguments
 *
 * @returns {module:jp-kernel~Config} Kernel config
 */
function parseCommandArguments() {
    var config = {
        cwd: process.cwd(),
        hideExecutionResult: false,
        hideUndefined: false,
        protocolVersion: "5.1",
        startupCallback: function() {
            log("startupCallback:", this.startupCallback);
        },
    };

    var usage = (
        "Usage: node kernel.js " +
        "[--debug] " +
        "[--hide-execution-result] " +
        "[--hide-undefined] " +
        "[--protocol=Major[.minor[.patch]]] " +
        "[--session-working-dir=path] " +
        "[--show-undefined] " +
        "[--startup-script=path] " +
        "connection_file"
    );

    var FLAGS = [
        ["--debug", function() {
            config.debug = true;
        }],
        ["--hide-execution-result", function() {
            config.hideExecutionResult = true;
        }],
        ["--hide-undefined", function() {
            config.hideUndefined = true;
        }],
        ["--protocol=", function(setting) {
            config.protocolVersion = setting;
        }],
        ["--session-working-dir=", function(setting) {
            config.cwd = setting;
        }],
        ["--show-undefined", function() {
            config.hideUndefined = false;
        }],
        ["--startup-script=", function(setting) {
            config.startupScript = setting;
        }],
    ];



    try {
        var connectionFile;
		//process.argv.slice(2)
		var parameters;//=process.argv.slice(2);
		switch(IsZBlack)
		{
			case 0:
				parameters=process.argv.slice(2);
				break;
			case 1:
				parameters=process.argv.slice(3);
				break;
			case 2:
				parameters=process.argv.slice(4);
				break;
		}
		console.error("parameters",parameters)

        //process.argv.slice(2)
		parameters
			.forEach(
				function(arg) 
				{
					z3log("checking args", arg);
					for (var i = 0; i < FLAGS.length; i++) {
						var flag = FLAGS[i];
						var label = flag[0];
						var action = flag[1];

						var matchesFlag = (arg.indexOf(label) === 0);
						if (matchesFlag) {
							var setting = arg.slice(label.length);
							action(setting);
							return;
						}
					}

					// if (connectionFile) {
						// throw new Error("Error: too many arguments");
					// }

					//connectionFile = arg;
					// jp 02202023
					if(IsZBlack>0)
					{
						if(arg.match(/\.json$/i)) // if json it is the connection file
						{
							connectionFile = arg;
						}
					}
					else
					{
						connectionFile = arg;
					}
				}
			);
		z3log(["connectionFile",connectionFile])
        if (!connectionFile) {
            throw new Error("Error: missing connection_file");
        }

        config.connection = JSON.parse(fs.readFileSync(connectionFile));

    } catch (e) {
        console.error("KERNEL: ARGV:", process.argv);
        console.error(usage);
        throw e;
    }
	
	z3log("in kernel 01")

    var nodeVersion;
    var protocolVersion;
    var iz3Version;
    var majorVersion = parseInt(config.protocolVersion.split(".")[0]);
    if (majorVersion <= 4) {
        nodeVersion = process.versions.node.split(".")
            .map(function(v) {
                return parseInt(v, 10);
            });
        protocolVersion = config.protocolVersion.split(".")
            .map(function(v) {
                return parseInt(v, 10);
            });
        config.kernelInfoReply = {
            "language": "javascript",
            "language_version": nodeVersion,
            "protocol_version": protocolVersion,
        };
    } else {
        nodeVersion = process.versions.node;
        protocolVersion = config.protocolVersion;
        iz3Version = JSON.parse(
            //fs.readFileSync(path.join(__dirname, "..", "package.json"))
            //fs.readFileSync(path.join(__dirname, "."+".", "package.json"))
            //fs.readFileSync(path.join(GetLastLoadedSrcFile, "."+".", "package.json")) // ..  replace with two strings with one dot for z3parsing issue found. need to resolve it 02232023
            fs.readFileSync(path.join(path.dirname(GetLastLoadedSrcFile()), "."+".", "package.json")) // ..  replace with two strings with one dot for z3parsing issue found. need to resolve it 02232023
        ).version;
        config.kernelInfoReply = {
            "protocol_version": protocolVersion,
            "implementation": "iz3",
            "implementation_version": iz3Version,
            "language_info": {
                "name": "javascript",
                "version": nodeVersion,
                "mimetype": "application/javascript",
                "file_extension": ".js",
            },
            "banner": (
                "iz3 v" + iz3Version + "\n" +
                "https://github.com/n-riesco/iz3\n"
            ),
            "help_links": [{
                "text": "iz3 Homepage",
                "url": "https://github.com/n-riesco/iz3",
            }],
        };
    }
	z3log("in kernel 02")
    return config;
}
z3log("in kernel 03")
