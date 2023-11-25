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
	prompt := inputs[0].String()
	promptTokens := vocab.Encode(prompt)
	timeStart := time.Now()
	pos, token := 0, 1
	for pos < llmSteps {
		// forward the transformer to get logits for the next token
		llama2.Transformer(token, pos, config, runState, transformerWeights)

		var next int
		if pos < len(promptTokens) {
			next = promptTokens[pos]
		} else {
			// sample the next token
			if llmTemperature == 0 {
				// greedy argmax sampling
				next = nn.ArgMax(runState.Logits)
			} else {
				// apply the temperature to the logits
				for q := 0; q < config.VocabSize; q++ {
					runState.Logits[q] /= float32(llmTemperature)
				}
				// apply softmax to the logits to the probabilities for next token
				nn.SoftMax(runState.Logits)
				// we now want to sample from this distribution to get the next token
				if llmTopP <= 0 || llmTopP >= 1 {
					// simply sample from the predicted probability distribution
					next = nn.Sample(runState.Logits)
				} else {
					// top-p (nucleus) sampling, clamping the least likely tokens to zero
					next = nn.SampleTopP(runState.Logits, float32(llmTopP))
				}
			}
		}
		pos++

		// data-dependent terminating condition: the BOS (1) token delimits sequences
		if next == 1 {
			break
		}

		// following BOS (1) token, sentencepiece decoder strips any leading whitespace
		var tokenStr string
		if token == 1 && vocab.Words[next][0] == ' ' {
			tokenStr = vocab.Words[next][1:]
		} else {
			tokenStr = vocab.Words[next]
		}
		fmt.Println(tokenStr)
		appendText(tokenStr)

		// advance forward
		token = next
	}
	fmt.Println()

	fmt.Printf("achieved tok/s: %f\n", float64(pos-1)/time.Since(timeStart).Seconds())

	return nil
}

const answerElementClass = "answer"

func appendText(text string) {
	answerElements := js.Global().Get("document").Call("getElementsByClassName", answerElementClass)
	lastAnswerElement := answerElements.Index(answerElements.Length() - 1)
	lastAnswerElement.Set("textContent", lastAnswerElement.Get("textContent").String()+text)
}

func registerFunctions() {
	js.Global().Set("prepare", js.FuncOf(prepare))
	js.Global().Set("generate", js.FuncOf(generate))
}

func main() {
	registerFunctions()
	<-make(chan bool)
}
