function generateCode() {
  const input = document.getElementById("commands").value.trim().toLowerCase();
  const lines = input.split("\n");

  let includes = "";
  let variables = "";
  let setup = "";
  let loop = "";

  let usesServo = false;
  let usesLED = false;
  let usesMotor = false;

  lines.forEach(line => {
    // Servo
    if (line.includes("servo")) usesServo = true;

    // LED
    if (line.includes("led")) usesLED = true;

    // Motor
    if (line.includes("motor")) usesMotor = true;

    // Herken patronen
    // Knop + Servo
    if (line.includes("als") && line.includes("knop") && line.includes("servo")) {
      const knopMatch = line.match(/knop\s*(\d+)/);
      const servoMatch = line.match(/servo\s*(\d+)/);
      const numbers = line.match(/\d+/g);
      const angle = numbers ? numbers[numbers.length - 1] : 90;

      const knop = knopMatch ? knopMatch[1] : 1;
      const servo = servoMatch ? servoMatch[1] : 1;

      // richting
      let adjustedAngle = angle;
      if (line.includes("links")) adjustedAngle = 180 - angle;
      if (line.includes("rechts")) adjustedAngle = angle;

      variables += `Servo servo${servo};\n`;
      setup += `  pinMode(${knop}, INPUT);\n  servo${servo}.attach(${9 + (servo-1)});\n`;
      loop += `  if (digitalRead(${knop}) == HIGH) {\n    servo${servo}.write(${adjustedAngle});\n  }\n`;
    }

    // Knop + LED
    if (line.includes("als") && line.includes("knop") && line.includes("led")) {
      const knopMatch = line.match(/knop\s*(\d+)/);
      const ledMatch = line.match(/led\s*(\d+)/);

      const knop = knopMatch ? knopMatch[1] : 1;
      const led = ledMatch ? ledMatch[1] : 1;

      variables += `int ledPin${led} = ${led + 8};\n`; // vb: start bij pin 9
      setup += `  pinMode(${knop}, INPUT);\n  pinMode(ledPin${led}, OUTPUT);\n`;
      loop += `  if (digitalRead(${knop}) == HIGH) {\n    digitalWrite(ledPin${led}, HIGH);\n  } else {\n    digitalWrite(ledPin${led}, LOW);\n  }\n`;
    }

    // Knop + Motor (PWM)
    if (line.includes("als") && line.includes("knop") && line.includes("motor")) {
      const knopMatch = line.match(/knop\s*(\d+)/);
      const motorMatch = line.match(/motor\s*(\d+)/);
      const numbers = line.match(/\d+/g);
      const speed = numbers ? numbers[numbers.length - 1] : 128; // snelheid 0-255

      const knop = knopMatch ? knopMatch[1] : 1;
      const motor = motorMatch ? motorMatch[1] : 1;

      variables += `int motorPin${motor} = ${motor + 8};\n`;
      setup += `  pinMode(${knop}, INPUT);\n  pinMode(motorPin${motor}, OUTPUT);\n`;
      loop += `  if (digitalRead(${knop}) == HIGH) {\n    analogWrite(motorPin${motor}, ${speed});\n  } else {\n    analogWrite(motorPin${motor}, 0);\n  }\n`;
    }
  });

  if (usesServo) includes += "#include <Servo.h>\n";

  const code = `${includes}\n${variables}\nvoid setup() {\n${setup}}\n\nvoid loop() {\n${loop}}\n`;

  document.getElementById("output").textContent = code;
  document.getElementById("downloadBtn").style.display = "inline-block";
}

function downloadCode() {
  const code = document.getElementById("output").textContent;
  const blob = new Blob([code], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "modelteck_project.ino";
  a.click();
  URL.revokeObjectURL(url);
}
