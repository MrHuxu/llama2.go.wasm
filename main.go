package main

import (
	"bytes"
	"fmt"
	"log"
	"syscall/js"
	"time"

	nn "github.com/nikolaydubina/llama2.go/exp/nnfast"
	"github.com/nikolaydubina/llama2.go/llama2"
)

var (
	llmTemperature = 0.9
	llmSteps       = 256
	llmTopP        = 0.9
)

var (
	config             llama2.Config
	runState           llama2.RunState
	transformerWeights llama2.TransformerWeights
	vocab              llama2.Vocab
)

func prepare(_ js.Value, inputs []js.Value) interface{} {
	modelFileData := inputs[0]
	modelFileDataLength := inputs[1].Int()
	modelFileBytes := make([]byte, modelFileDataLength)
	js.CopyBytesToGo(modelFileBytes, modelFileData)

	var err error
	config, err = llama2.NewConfigFromCheckpoint(bytes.NewReader(modelFileBytes))
	if err != nil {
		log.Fatalf("cannot read config: %s", err)
	}
	log.Printf("config: %+v \n", config)

	modelFileBytes = modelFileBytes[28:]

	tokenizerFileData := inputs[2]
	tokenizerFileDataLength := inputs[3].Int()
	tokenizerFileBytes := make([]byte, tokenizerFileDataLength)
	js.CopyBytesToGo(tokenizerFileBytes, tokenizerFileData)

	runState = llama2.NewRunState(config)

	isSharedWeights := config.VocabSize > 0
	if config.VocabSize < 0 {
		config.VocabSize = -config.VocabSize
	}
	transformerWeights = llama2.NewTransformerWeightsFromCheckpoint(config, bytes.NewReader(modelFileBytes), isSharedWeights)

	vocab = llama2.NewVocabFromFile(config.VocabSize, bytes.NewReader(tokenizerFileBytes))

	if llmSteps <= 0 || llmSteps > config.SeqLen {
		llmSteps = config.SeqLen
	}

	return nil
}

func generate(_ js.Value, inputs []js.Value) interface{} {
	defer inputs[2].Invoke()

	prompt := inputs[0].String()
	promptTokens := vocab.Encode(prompt)
	timeStart := time.Now()
	pos, token := 0, 1
	for pos < llmSteps {
		llama2.Transformer(token, pos, config, runState, transformerWeights)

		var next int
		if pos < len(promptTokens) {
			next = promptTokens[pos]
		} else {
			if llmTemperature == 0 {
				next = nn.ArgMax(runState.Logits)
			} else {
				for q := 0; q < config.VocabSize; q++ {
					runState.Logits[q] /= float32(llmTemperature)
				}
				nn.SoftMax(runState.Logits)
				if llmTopP <= 0 || llmTopP >= 1 {
					next = nn.Sample(runState.Logits)
				} else {
					next = nn.SampleTopP(runState.Logits, float32(llmTopP))
				}
			}
		}
		pos++

		if next == 1 {
			break
		}

		var tokenStr string
		if token == 1 && vocab.Words[next][0] == ' ' {
			tokenStr = vocab.Words[next][1:]
		} else {
			tokenStr = vocab.Words[next]
		}
		inputs[1].Invoke(tokenStr)

		token = next
	}
	inputs[1].Invoke(fmt.Sprintf("[TOKEN_SPEED]%f", float64(pos-1)/time.Since(timeStart).Seconds()))

	return nil
}

func registerFunctions() {
	js.Global().Set("prepare", js.FuncOf(prepare))
	js.Global().Set("generate", js.FuncOf(generate))
}

func main() {
	registerFunctions()
	<-make(chan bool)
}
